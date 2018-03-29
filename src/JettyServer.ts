'use strict';
import * as vscode from "vscode";
import * as Constants from './Constants';

export class JettyServer extends vscode.TreeItem implements vscode.QuickPickItem {
    public label: string;
    public description: string;
    public detail?: string;

    public state: Constants.ServerState;

    public startArguments: string;

    public outputChannel: vscode.OutputChannel;
    constructor(public name: string, public installPath: string, public storagePath: string) {
        super(name);
        this.outputChannel = vscode.window.createOutputChannel(`jetty_${this.name}`);
        this.state = Constants.ServerState.IdleServer;
        this.startArguments = 'STOP.PORT=8080 STOP.KEY=stop_secret';

    }

    public isRunning(): boolean {
        return this.state === Constants.ServerState.RunningServer;
    }
}