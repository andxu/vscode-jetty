'use strict';

import * as fse from 'fs-extra';
import * as _ from 'lodash';
import * as path from 'path';
import * as vscode from "vscode";
import { TreeItem } from "vscode";
import * as Constants from './Constants';
import { JettyServer } from "./JettyServer";
import { JettyServerModel } from "./JettyServerModel";
import { WarPackage } from "./WarPackage";

export class JettyServerTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    public _onDidChangeTreeData: vscode.EventEmitter<TreeItem> = new vscode.EventEmitter<TreeItem>();
    public readonly onDidChangeTreeData?: vscode.Event<vscode.TreeItem> = this._onDidChangeTreeData.event;
    constructor(private _context: vscode.ExtensionContext, private _tomcatModel: JettyServerModel) {
        this._onDidChangeTreeData.fire();
    }
    public getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    public async getChildren(element?: vscode.TreeItem): Promise<TreeItem[]> {
        if (!element) {
            return this._tomcatModel.getServerSet().map((server: JettyServer) => {
                server.iconPath = this._context.asAbsolutePath(path.join('resources', `${server.state}.svg`));
                server.contextValue = server.state;
                server.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
                return server;
            });
        } else if (element.contextValue === Constants.ServerState.IdleServer || element.contextValue === Constants.ServerState.RunningServer) {
            const server: JettyServer = <JettyServer>element;
            const webapps: string = path.join(server.storagePath, 'webapps');
            const iconPath: string = this._context.asAbsolutePath(path.join('resources', 'war.jpg'));
            if (await fse.pathExists(webapps)) {
                const wars: string[] = [];
                let temp: fse.Stats;
                let fileExtension: string;
                // show war packages with no extension if there is one
                // and no need to show war packages if its unzipped folder exists
                const promises: Promise<void>[] = (await fse.readdir(webapps)).map(async (w: string) => {
                    if (w.toUpperCase() !== 'ROOT') {
                        temp = await fse.stat(path.join(webapps, w));
                        fileExtension = path.extname(path.join(webapps, w));
                        if (temp.isDirectory() || (temp.isFile() && fileExtension === Constants.WAR_FILE_EXTENSION)) {
                            wars.push(fileExtension === Constants.WAR_FILE_EXTENSION ? path.basename(w, fileExtension) : w);
                        }
                    }
                });
                await Promise.all(promises);
                // tslint:disable-next-line:underscore-consistent-invocation
                return _.uniq(wars).map((w: string) => {
                    return new WarPackage(w, server.name, iconPath, path.join(webapps, w));
                });
            }
            return [];
        }
    }

    public refresh(element: TreeItem): void {
        this._onDidChangeTreeData.fire(element);
    }
    // tslint:disable-next-line:no-empty
    public dispose(): void {}
}
