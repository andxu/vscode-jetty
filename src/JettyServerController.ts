'use strict';

import * as _ from "lodash";
import * as path from "path";
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
        JettyServerController.terminal.sendText(`java -jar ${jettyHome} --create-startd`);
        JettyServerController.terminal.sendText(`java -jar ${jettyHome} --add-to-start=http,deploy`);
        return newServer;
    }

    public async startServer(server: JettyServer): Promise<void> {
        const jettyHome: string = path.join(server.installPath, 'start.jar');
        const jettyBase: string = path.join(this._jettyServerModel.defaultStoragePath, server.name);
        JettyServerController.terminal.show();
        JettyServerController.terminal.sendText(`javar -jar ${jettyHome} "jetty.base=${jettyBase}" ${server.startArguments}`);
    }
    public async deleteServer(server: JettyServer): Promise<void> {
        server = await this.precheck(server);
        if (server) {
            if (server.isRunning()) {
                const confirmation: MessageItem = await vscode.window.showWarningMessage(Constants.deleteConfirm, Constants.yes , Constants.cancel);
                if (confirmation !== Constants.yes) {
                    return;
                }
                await this.stopServer(server);
            }
            this._jettyServerModel.deleteServer(server);
        }
    }
    public async stopServer(server: JettyServer): Promise<void> {
        const jettyHome: string = path.join(server.installPath, 'start.jar');
        JettyServerController.terminal.sendText(`java -jar ${jettyHome} ${server.startArguments} --stop`);
    }
    public async debugWarPackage(war: vscode.Uri): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public async deployWarPackage(war: vscode.Uri): Promise<void> {
        throw new Error("Method not implemented.");
    }

    // tslint:disable-next-line:no-empty
    public dispose(): void {}

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
