'use strict';

import * as vscode from "vscode";
import * as _ from "lodash";

export class JettyServerController {
    public async addServer(): Promise<void> {
        const pathPick: vscode.Uri[] = await vscode.window.showOpenDialog({
            defaultUri: vscode.workspace.rootPath ? vscode.Uri.file(vscode.workspace.rootPath) : undefined,
            canSelectFiles: false,
            canSelectFolders: true,
            openLabel: "Select Jetty Server Directory"
        });
        if (_.isEmpty(pathPick) || !pathPick[0].fsPath) {
            return;
        }
        // todo qisun
    }
    deleteServer(arg0: any): any {
        throw new Error("Method not implemented.");
    }
    stopServer(arg0: any): any {
        throw new Error("Method not implemented.");
    }
    startServer(arg0: any): any {
        throw new Error("Method not implemented.");
    }
    public async debugWarPackage(war: vscode.Uri): Promise<void> {
        throw new Error("Method not implemented.");
    }
    deployWarPackage(arg0: any): any {
        throw new Error("Method not implemented.");
    }
    public dispose(): void {
    }
}