'use strict';

import * as vscode from "vscode";
import * as fse from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export async function validateInstallPath(installPath: string): Promise<boolean> {
    const startJarFileExists: Promise<boolean> = fse.pathExists(path.join(installPath, 'start.jar'));
    const startIniFileExists: Promise<boolean> = fse.pathExists(path.join(installPath, 'start.ini'));

    return await startJarFileExists && await startIniFileExists;
}

export async function getServerName(installPath: string, defaultStoragePath: string): Promise<string> {
    const workspace: string = await getWorkspace(defaultStoragePath);
    await fse.ensureDir(workspace);
    const fileNames: string[] = await fse.readdir(workspace);
    let serverName: string = path.basename(installPath);
    let index: number = 1;
    while (fileNames.indexOf(serverName) >= 0) {
        serverName = path.basename(installPath).concat(`-${index}`);
        index += 1;
    }
    return serverName;
}

export async function getServerStoragePath(defaultStoragePath: string, serverName: string): Promise<string> {
    return path.join(await getWorkspace(defaultStoragePath), serverName);
}

export function getTempStoragePath(): string {
    const chars: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    let result: string = '';
    for (let i: number = 0; i < 5; i += 1) {
        // tslint:disable-next-line:insecure-random
        const idx: number = Math.floor(chars.length * Math.random());
        result += chars[idx];
    }
    return path.resolve(os.tmpdir(), `vscodejetty_${result}`);
}

async function getWorkspace(defaultStoragePath: string): Promise<string> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('jetty');
    if (config) {
        // tslint:disable-next-line:no-backbone-get-set-outside-model
        const workspace: string = config.get<string>('workspace');
        if (workspace && workspace !== '') {
            await fse.ensureDir(workspace);
            return workspace;
        }
    }
    return path.join(defaultStoragePath, 'jetty');
}