'use strict';
import * as path from 'path';
import * as vscode from "vscode";
import * as Constants from './Constants';

export class JettyServer extends vscode.TreeItem implements vscode.QuickPickItem {
    public label: string;
    public description: string;
    public detail?: string;
    public startArguments: string[];
    public state: Constants.SERVER_STATE;
    public restart: boolean = false;
    public basePathName: string;
    private _isDebugging: boolean = false;
    private _debugPort: number;
    private _debugWorkspace: vscode.WorkspaceFolder;

    constructor(public name: string, public installPath: string, public storagePath: string) {
        super(name);
        this.state = Constants.SERVER_STATE.IdleServer;
        this.basePathName = path.basename(storagePath);
    }

    public setStarted(running: boolean): void {
        this.state = running ? Constants.SERVER_STATE.RunningServer : Constants.SERVER_STATE.IdleServer;
        vscode.commands.executeCommand('jetty.tree.refresh');
    }

    public isRunning(): boolean {
        return this.state === Constants.SERVER_STATE.RunningServer;
    }

    public isDebugging(): boolean {
        return this._isDebugging;
    }

    public setDebugInfo(debugging: boolean, port: number, workspace: vscode.WorkspaceFolder): void {
        this._isDebugging = debugging;
        this._debugPort = port;
        this._debugWorkspace = workspace;
    }

    public getDebugWorkspace(): vscode.WorkspaceFolder {
        return this._debugWorkspace;
    }

    public clearDebugInfo(): void {
        this._isDebugging = false;
        this._debugPort = undefined;
        this._debugWorkspace = undefined;
    }

    public getDebugPort(): number {
        return this._debugPort;
    }

    public rename(newName: string): void {
        this.name = newName;
        this.label = newName;
    }
}
