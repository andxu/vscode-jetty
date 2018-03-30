'use strict';

import * as fse from 'fs-extra';
import * as _ from "lodash";
import * as path from "path";
import * as portfinder from 'portfinder';
import * as vscode from "vscode";
import { MessageItem } from "vscode";
import * as Constants from './Constants';
import { JettyServer } from "./JettyServer";
import { JettyServerModel } from "./JettyServerModel";
import * as Utility from './Utility';

export class JettyServerController {
    private static terminal: vscode.Terminal = vscode.window.createTerminal('Jetty');
    constructor(private _jettyServerModel: JettyServerModel, private _extensionPath: string) {
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
            vscode.window.showErrorMessage('');
            return;
        }
        const serverName: string = await Utility.getServerName(installPath, this._jettyServerModel.defaultStoragePath);
        const jettyHome: string = path.join(installPath, 'start.jar');
        const jettyBase: string = await Utility.getServerStoragePath(this._jettyServerModel.defaultStoragePath, serverName);
        const newServer: JettyServer = new JettyServer(serverName, installPath, jettyBase);
        this._jettyServerModel.addServer(newServer);
        JettyServerController.terminal.show();
        JettyServerController.terminal.sendText(`java -jar ${jettyHome} "jetty.base=${jettyBase}" --create-startd`);
        JettyServerController.terminal.sendText(`java -jar ${jettyHome} "jetty.base=${jettyBase}" --add-to-start=http,deploy`);
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
                const javaProcess: Promise<void> = Utility.execute(server.outputChannel, 'java', { shell: true }, ...server.startArguments);
                server.setStarted(true);
                //this.startDebugSession(serverInfo);
                await javaProcess;
                server.setStarted(false);
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

    public async stopServer(server: JettyServer): Promise<void> {
        server = await this.precheck(server);
        if (server) {
            if (!server.isRunning) {
                vscode.window.showInformationMessage(Constants.serverStopped);
                return;
            }
            await Utility.execute(server.outputChannel, 'java', { shell: true }, ...server.startArguments.concat('--stop'));
        }
    }

    public async debugWarPackage(war: vscode.Uri): Promise<void> {
        // tslint:disable-next-line:no-console
        console.log(war);
    }
    public async deployWarPackage(uri: vscode.Uri, debug?: boolean): Promise<void> {
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
        const server: JettyServer = await this.selectServer(true);
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
            port = await portfinder.getPortPromise();
        }

        server.setDebugInfo(debug, port, workspaceFolder);
        if (server.isRunning()) {
            await this.restartServer(server);
        } else {
            await this.startServer(server);
        }
    }

    public async restartServer(server: JettyServer): Promise<void> {
        return undefined;
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

    // tslint:disable-next-line:no-empty
    public dispose(): void { }

    private async deployPackage(serverInfo: JettyServer, packagePath: string): Promise<void> {
        const appName: string =  path.basename(packagePath, path.extname(packagePath));
        const appPath: string = path.join(serverInfo.storagePath, 'webapps', appName);

        await fse.remove(appPath);
        await fse.mkdirs(appPath);
        await Utility.execute(serverInfo.outputChannel, 'jar', {cwd: appPath}, 'xvf', `${packagePath}`);
        vscode.commands.executeCommand('jetty.tree.refresh');
    }

    private async precheck(server: JettyServer): Promise<JettyServer> {
        if (_.isEmpty(this._jettyServerModel.getServerSet())) {
            vscode.window.showInformationMessage('');
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
