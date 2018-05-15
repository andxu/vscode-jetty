'use strict';

import * as fse from 'fs-extra';
import * as _ from "lodash";
import * as opn from 'opn';
import * as path from "path";
import * as portfinder from 'portfinder';
import { URL } from 'url';
import * as vscode from "vscode";
import { MessageItem } from "vscode";
import * as Constants from './Constants';
import { JettyServer } from "./JettyServer";
import { JettyServerModel } from "./JettyServerModel";
import * as Utility from './Utility';
import { WarPackage } from './WarPackage';

export class JettyServerController {
    private _outputChannel: vscode.OutputChannel;
    constructor(private _jettyServerModel: JettyServerModel, private _extensionPath: string) {
        this._outputChannel =  vscode.window.createOutputChannel('vscode-jetty');
    }

    public async addServer(): Promise<JettyServer> {
        const pathPick: vscode.Uri[] = await vscode.window.showOpenDialog({
            defaultUri: vscode.workspace.rootPath ? vscode.Uri.file(vscode.workspace.rootPath) : undefined,
            canSelectFiles: false,
            canSelectFolders: true,
            openLabel: Constants.selectJettyDirectory
        });
        if (_.isEmpty(pathPick) || !pathPick[0].fsPath) {
            return;
        }
        const installPath: string = pathPick[0].fsPath;
        if (!await Utility.validateInstallPath(installPath)) {
            vscode.window.showErrorMessage('The selected directory is not a valid Jetty server direcotry');
            return;
        }
        const existingServerNames: string[] = this._jettyServerModel.getServerSet().map((item: JettyServer) => { return item.name; });
        const serverName: string = await Utility.getServerName(installPath, this._jettyServerModel.defaultStoragePath, existingServerNames);
        const jettyHome: string = path.join(installPath, 'start.jar');
        const jettyBase: string = await Utility.getServerStoragePath(this._jettyServerModel.defaultStoragePath, serverName);
        const newServer: JettyServer = new JettyServer(serverName, installPath, jettyBase);
        this._jettyServerModel.addServer(newServer);
        await Promise.all([
            fse.copy(path.join(installPath, 'demo-base', 'start.d'), path.join(jettyBase, 'start.d')),
            fse.copy(path.join(installPath, 'start.ini'), path.join(jettyBase, 'start.ini')),
            fse.copy(path.join(installPath, 'demo-base', 'etc'), path.join(jettyBase, 'etc')),
            fse.copy(path.join(this._extensionPath, 'resources', 'ROOT'), path.join(jettyBase, 'webapps', 'ROOT'))
        ]);
        return newServer;
    }

    public async startServer(server: JettyServer): Promise<void> {
        server = server ? server : await this.selectServer(true);
        if (server) {
            if (server.isRunning()) {
                vscode.window.showInformationMessage(Constants.serverRunning);
                return;
            }
            try {
                const debugPort: number = await server.getDebugPort();
                const stopPort: number = await portfinder.getPortPromise({ port: debugPort + 1, host: '127.0.0.1' });
                server.startArguments = ['-jar', path.join(server.installPath, 'start.jar'), `"jetty.base=${server.storagePath}"`, `"-DSTOP.PORT=${stopPort}"`, '"-DSTOP.KEY=STOP"'];
                const args: string[] = debugPort ? ['-Xdebug', `-agentlib:jdwp=transport=dt_socket,address=${debugPort},server=y,suspend=n`].concat(server.startArguments) : server.startArguments;
                const javaProcess: Promise<void> = Utility.execute(this._outputChannel, server.name, 'java', { shell: true }, ...args);
                server.setStarted(true);
                if (debugPort) {
                    this.startDebugSession(server);
                }
                await javaProcess;
                server.setStarted(false);
                if (server.restart) {
                    server.restart = false;
                    await this.startServer(server);
                }
            } catch (err) {
                server.setStarted(false);
                vscode.window.showErrorMessage(err.toString());
            }
        }
    }

    public async deleteServer(server: JettyServer): Promise<void> {
        server = await this.precheck(server);
        if (server) {
            if (server.isRunning()) {
                const confirmation: MessageItem = await vscode.window.showWarningMessage(Constants.deleteConfirm, Constants.yes, Constants.cancel);
                if (confirmation !== Constants.yes) {
                    return;
                }
                await this.stopServer(server);
            }
            this._jettyServerModel.deleteServer(server);
        }
    }

    public async stopServer(server: JettyServer, restart?: boolean): Promise<void> {
        server = await this.precheck(server);
        if (server) {
            if (!server.isRunning()) {
                vscode.window.showInformationMessage(Constants.serverStopped);
                return;
            }
            if (!restart) {
                server.clearDebugInfo();
            }
            server.restart = restart;
            await Utility.execute(this._outputChannel, server.name, 'java', { shell: true }, ...server.startArguments.concat('--stop'));
        }
    }
    public async runWarPackage(uri: vscode.Uri, debug?: boolean, server?: JettyServer): Promise<void> {
        if (!uri) {
            const dialog: vscode.Uri[] = await vscode.window.showOpenDialog({
                defaultUri: vscode.workspace.rootPath ? vscode.Uri.file(vscode.workspace.rootPath) : undefined,
                canSelectFiles: true,
                canSelectFolders: false,
                openLabel: Constants.selectWarPackage
            });
            if (_.isEmpty(dialog) || !dialog[0].fsPath) {
                return;
            }
            uri = dialog[0];
        }

        const packagePath: string = uri.fsPath;
        if (!server) {
            server = await this.selectServer(true);
        }
        if (!server) {
            return;
        }
        await this.deployPackage(server, packagePath);
        if (server.isRunning() && ((!server.isDebugging() && !debug) || server.isDebugging() === debug)) {
            return;
        }
        let port: number;
        let workspaceFolder: vscode.WorkspaceFolder;

        if (debug) {
            if (vscode.workspace.workspaceFolders) {
                workspaceFolder = vscode.workspace.workspaceFolders.find((f: vscode.WorkspaceFolder): boolean => {
                    const relativePath: string = path.relative(f.uri.fsPath, packagePath);
                    return relativePath === '' || (!relativePath.startsWith('..') && relativePath !== packagePath);
                });
            }
            if (!workspaceFolder) {
                vscode.window.showErrorMessage(Constants.noPackage);
                return;
            }
            port = await portfinder.getPortPromise({ host: '127.0.0.1' });
        }

        server.setDebugInfo(debug, port, workspaceFolder);
        if (server.isRunning()) {
            await this.stopServer(server, true);
        } else {
            await this.startServer(server);
        }
    }

    public async browseServer(server: JettyServer): Promise<void> {
        if (server) {
            if (!server.isRunning()) {
                const result: MessageItem = await vscode.window.showInformationMessage(Constants.startServer, Constants.yes, Constants.no);
                if (result !== Constants.yes) {
                    return;
                }
                this.startServer(server);
            }
            const httpPort: string = await Utility.getConfig(server.storagePath, 'http.ini', 'jetty.http.port');
            opn(new URL(`${Constants.localhost}:${httpPort}`).toString());
        }
    }

    public async renameServer(server: JettyServer): Promise<void> {
        server = await this.precheck(server);
        if (server) {
            const newName: string = await vscode.window.showInputBox({
                prompt: 'input a new server name',
                validateInput: (name: string): string => {
                    if (!name.match(/^[\w.-]+$/)) {
                        return 'please input a valid server name';
                    } else if (this._jettyServerModel.getJettyServer(name)) {
                        return 'the name was already taken, please re-input';
                    }
                    return null;
                }
            });
            if (newName) {
                server.rename(newName);
                await this._jettyServerModel.saveServerList();
            }
        }
    }

    public async deleteWarPackage(warPackage: WarPackage): Promise<void> {
        if (warPackage) {
            await fse.remove(warPackage.storagePath);
            await fse.remove(`${warPackage.storagePath}.war`);
            vscode.commands.executeCommand('jetty.tree.refresh');
        }
    }

    public revealWarPackage(warPackage: WarPackage): void {
        if (warPackage) {
            opn(warPackage.storagePath);
        }
    }

    public async browseWarPackage(warPackage: WarPackage): Promise<void> {
        if (warPackage) {
            const server: JettyServer = this._jettyServerModel.getJettyServer(warPackage.serverName);
            const httpPort: string = await Utility.getConfig(server.storagePath, 'http.ini', 'jetty.http.port');
            if (!httpPort) {
                vscode.window.showErrorMessage(Constants.httpPortUndefined);
                return;
            }
            if (!server.isRunning()) {
                const result: MessageItem = await vscode.window.showInformationMessage(Constants.startServer, Constants.yes, Constants.no);
                if (result === Constants.yes) {
                    this.startServer(server);
                }
            }
            opn(new URL(warPackage.label, `${Constants.localhost}:${httpPort}`).toString());
        }
    }

    public async generateWarPackage(): Promise<void> {
        const name: string = vscode.workspace.name;
        await Utility.execute(this._outputChannel, undefined, 'jar', { cwd: vscode.workspace.rootPath, shell: true }, 'cvf', ...[`"${name}.war"`, '*']);
    }

    // tslint:disable-next-line:no-empty
    public dispose(): void {
        this._jettyServerModel.getServerSet().forEach((element: JettyServer) => {
            if (element.isRunning()) {
                this.stopServer(element);
            }
            this._outputChannel.dispose();
        });
        this._jettyServerModel.saveServerListSync();
    }

    private startDebugSession(server: JettyServer): void {
        if (!server || !server.getDebugPort() || !server.getDebugWorkspace()) {
            return;
        }
        const config: vscode.DebugConfiguration = {
            type: 'java',
            name: `${Constants.DEBUG_SESSION_NAME}_${server.basePathName}`,
            request: 'attach',
            hostName: 'localhost',
            port: server.getDebugPort()
        };

        setTimeout(() => vscode.debug.startDebugging(server.getDebugWorkspace(), config), 500);
    }

    private async deployPackage(server: JettyServer, packagePath: string): Promise<void> {
        const appName: string = path.basename(packagePath, path.extname(packagePath));
        const appPath: string = path.join(server.storagePath, 'webapps', appName);

        await fse.remove(appPath);
        await fse.mkdirs(appPath);
        await Utility.execute(this._outputChannel, server.name, 'jar', { cwd: appPath }, 'xvf', `${packagePath}`);
        vscode.commands.executeCommand('jetty.tree.refresh');
    }

    private async precheck(server: JettyServer): Promise<JettyServer> {
        if (_.isEmpty(this._jettyServerModel.getServerSet())) {
            vscode.window.showInformationMessage(Constants.noServer);
            return;
        }
        return server ? server : await this.selectServer();
    }

    private async selectServer(createIfNoneServer: boolean = false): Promise<JettyServer> {
        let items: vscode.QuickPickItem[] = this._jettyServerModel.getServerSet();
        if (_.isEmpty(items) && !createIfNoneServer) {
            return;
        }
        if (items.length === 1) {
            return <JettyServer>items[0];
        }
        items = createIfNoneServer ? items.concat({ label: `$(plus) ${Constants.addServer}`, description: '' }) : items;
        const pick: vscode.QuickPickItem = await vscode.window.showQuickPick(
            items,
            { placeHolder: createIfNoneServer && items.length === 1 ? Constants.addServer : Constants.selectServer }
        );

        if (pick) {
            if (pick instanceof JettyServer) {
                return pick;
            } else {
                return await this.addServer();
            }
        }
    }

}
