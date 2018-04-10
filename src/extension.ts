'use strict';

import * as vscode from 'vscode';
import { JettyServer } from './JettyServer';
import { JettyServerController } from './JettyServerController';
import { JettyServerModel } from './JettyServerModel';
import { JettyServerTreeProvider } from './JettyServerTreeProvider';
import * as Utility from './Utility';
import { WarPackage } from './WarPackage';

export function activate(context: vscode.ExtensionContext): void {
    const jettyServerModel: JettyServerModel = new JettyServerModel(context.storagePath ? context.storagePath : Utility.getTempStoragePath());
    const jettyServerController: JettyServerController = new JettyServerController(jettyServerModel, context.extensionPath);
    const jettyServerTree: JettyServerTreeProvider = new JettyServerTreeProvider(context, jettyServerModel);

    context.subscriptions.push(jettyServerController);
    context.subscriptions.push(jettyServerTree);
    context.subscriptions.push(vscode.window.registerTreeDataProvider('jettyServerExplorer', jettyServerTree));

    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.add', () => { jettyServerController.addServer(); }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.rename', (server: JettyServer) => jettyServerController.renameServer(server)));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.rename.context', (server: JettyServer) => jettyServerController.renameServer(server)));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.start', (server: JettyServer) => { jettyServerController.startServer(server); }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.start.context', (server: JettyServer) => { jettyServerController.startServer(server); }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.restart', (server: JettyServer) => { jettyServerController.stopServer(server, true); }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.restart.context', (server: JettyServer) => { jettyServerController.stopServer(server, true); }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.stop', (server: JettyServer) => { jettyServerController.stopServer(server); }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.stop.context', (server: JettyServer) => { jettyServerController.stopServer(server); }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.delete', (server: JettyServer) => { jettyServerController.deleteServer(server); }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.delete.context', (server: JettyServer) => { jettyServerController.deleteServer(server); }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.browse', (server: JettyServer) => { jettyServerController.browseServer(server); }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.debug', (server: JettyServer) => { jettyServerController.runWarPackage(undefined, true, server); }));

    context.subscriptions.push(vscode.commands.registerCommand('jetty.war.run', (uri: vscode.Uri) => { jettyServerController.runWarPackage(uri); }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.war.debug', (uri: vscode.Uri) => { jettyServerController.runWarPackage(uri, true); }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.war.delete', (warPackage: WarPackage) => { jettyServerController.deleteWarPackage(warPackage); }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.war.reveal', (warPackage: WarPackage) => { jettyServerController.revealWarPackage(warPackage); }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.war.browse', (warPackage: WarPackage) => {jettyServerController.browseWarPackage(warPackage); }));

    context.subscriptions.push(vscode.commands.registerCommand('jetty.tree.refresh', (server: JettyServer) => { jettyServerTree.refresh(server); }));
}

// tslint:disable-next-line:no-empty
export function deactivate(): void { }
