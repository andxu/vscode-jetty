'use strict';
import * as vscode from "vscode";

export class JettyServer extends vscode.TreeItem implements vscode.QuickPickItem{
    public label: string;
    public description: string;
    public detail?: string;
    constructor(public name: string, public installPath: string) {
        super(name);
    }
}