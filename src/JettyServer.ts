'use strict';
import * as path from 'path';
import * as vscode from "vscode";
import * as Constants from './Constants';

export class JettyServer extends vscode.TreeItem implements vscode.QuickPickItem {
    public label: string;
    public description: string;
    public detail?: string;
    public outputChannel: vscode.OutputChannel;
    public startArguments: string[];
    public state: Constants.ServerState;
    private _isDebugging: boolean = false;
    private _debugPort: number;
    private _debugWorkspace: vscode.WorkspaceFolder;

    constructor(public name: string, public installPath: string, public storagePath: string) {
        super(name);
        this.outputChannel = vscode.window.createOutputChannel(`jetty_${this.name}`);
        this.state = Constants.ServerState.IdleServer;
        this.startArguments = ['-jar', path.join(this.installPath, 'start.jar'), `"jetty.base=${this.storagePath}"`, '-DSTOP.PORT=9999', '-DSTOP.KEY=STOP'];
    }

    public setStarted(running: boolean): void {
        this.state = running ? Constants.ServerState.RunningServer : Constants.ServerState.IdleServer;
        vscode.commands.executeCommand('jetty.tree.refresh');
    }

    public isRunning(): boolean {
        return this.state === Constants.ServerState.RunningServer;
    }

    public isDebugging(): boolean {
        return this._isDebugging;
    }

    public setDebugInfo(debugging: boolean, port: number, workspace: vscode.WorkspaceFolder): void {
        this._isDebugging = debugging;
        this._debugPort = port;
        this._debugWorkspace = workspace;
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
