'use strict';

import * as vscode from 'vscode';
import { JettyServer } from './JettyServer';
import { JettyServerController } from './JettyServerController';
import { JettyServerModel } from './JettyServerModel';
import { JettyServerTreeProvider } from './JettyServerTreeProvider';
import * as Utility from './Utility';
import { WarPackage } from './WarPackage';

export function activate(context: vscode.ExtensionContext): void {
    let storagePath: string = context.storagePath;
    if (!storagePath) {
        storagePath = Utility.getTempStoragePath();
    }
    const jettyServerModel: JettyServerModel = new JettyServerModel(storagePath);
    const jettyServerController: JettyServerController = new JettyServerController(jettyServerModel, context.extensionPath);
    const jettyServerTree: JettyServerTreeProvider = new JettyServerTreeProvider(context, jettyServerModel);

    context.subscriptions.push(jettyServerController);
    context.subscriptions.push(jettyServerTree);

    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.add', () => { jettyServerController.addServer(); }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.start', (server: JettyServer) => { jettyServerController.startServer(server); }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.stop', (server: JettyServer) => { jettyServerController.stopServer(server); }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.delete', (server: JettyServer) => { jettyServerController.deleteServer(server); }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.war.deploy', (uri: vscode.Uri) => { jettyServerController.deployWarPackage(uri); }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.war.debug', (uri: vscode.Uri) => { jettyServerController.debugWarPackage(uri); }));
}

// tslint:disable-next-line:no-empty
export function deactivate(): void {}
