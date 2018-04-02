'use strict';

import { MessageItem } from "vscode";

export const yes: MessageItem = { title: 'Yes' };
export const no: MessageItem = { title: 'No', isCloseAffordance: true };
export const cancel: MessageItem = { title: 'Cancel', isCloseAffordance: true };

export const addServer: string = 'Add Jetty Server';
export const selectServer: string = 'Select Jetty Server';

export const selectJettyDirectory: string = 'Select Jetty Directory';

export const deleteConfirm: string = 'This Jetty Server is running, are you sure you want to delete it?';

export const serverRunning: string = 'This Jetty Serverrver is running.';

export const serverStopped: string = 'This Jetty Server is not running.';

export const selectWarPackage: string = 'Select War Package';

export const startServer: string = 'The Jetty server needs to be started before browsing. Would you like to start it now?';

// tslint:disable-next-line:no-http-string
export const localhost: string = 'http://localhost';

export const httpPortUndefined: string = 'Error: server http port is undefined!';

export const noPackage: string = 'The selected package is not under current workspace.';

export const warFileExtension: string = '.war';

export enum ServerState {
    RunningServer = 'runningserver',
    IdleServer = 'idleserver'
}
