'use strict';

import * as vscode from 'vscode';
import { JettyServer } from './JettyServer';
import { JettyServerController } from './JettyServerController';
import { JettyServerTreeProvider } from './JettyServerTreeProvider';
import { WarPackage } from './WarPackage';

export function activate(context: vscode.ExtensionContext) {

    const jettyServerController: JettyServerController = new JettyServerController();
    const jettyServerTree: JettyServerTreeProvider = new JettyServerTreeProvider();

    context.subscriptions.push(jettyServerController);
    context.subscriptions.push(jettyServerTree);
    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.add', () => {
        jettyServerController.addServer();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.start', (server: JettyServer) => {
        jettyServerController.startServer(server);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.stop', (server: JettyServer) => {
        jettyServerController.stopServer(server);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('jetty.server.delete', (server: JettyServer) => {
        jettyServerController.deleteServer(server);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('jetty.war.deploy', (uri: vscode.Uri) => {
        jettyServerController.deployWarPackage(uri);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('jetty.war.debug', (uri: vscode.Uri) => {
        jettyServerController.debugWarPackage(uri);
    }));
}

// this method is called when your extension is deactivated
export function deactivate() {
}