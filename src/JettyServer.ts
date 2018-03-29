'use strict';
import * as vscode from "vscode";
import {ServerState} from './Constants';

export class JettyServer extends vscode.TreeItem implements vscode.QuickPickItem {
    public label: string;
    public description: string;
    public detail?: string;

    public state: ServerState;

    public startArguments: string;

    public outputChannel: vscode.OutputChannel;
    constructor(public name: string, public installPath: string, public storagePath: string) {
        super(name);
        this.outputChannel = vscode.window.createOutputChannel(`jetty_${this.name}`);
        this.state = ServerState.IdleServer;
        this.startArguments = 'STOP.PORT=8080 STOP.KEY=stop_secret';

    }

    public isRunning(): boolean {
        return this.state === ServerState.RunningServer;
    }
}