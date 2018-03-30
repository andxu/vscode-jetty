'use strict';
import * as path from 'path';
import * as vscode from "vscode";
import * as Constants from './Constants';

export class JettyServer extends vscode.TreeItem implements vscode.QuickPickItem {
    public label: string;
    public description: string;
    public detail?: string;

    public state: Constants.ServerState;

    public startArguments: string[];

    public outputChannel: vscode.OutputChannel;
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
}
