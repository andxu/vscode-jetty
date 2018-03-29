'use strict';

import { MessageItem } from "vscode";

export const yes: MessageItem = { title: 'Yes' };
export const no: MessageItem = { title: 'No', isCloseAffordance: true };
export const cancel: MessageItem = { title: 'Cancel', isCloseAffordance: true };

export const addServer: string = 'Add Jetty Server';
export const selectServer: string = 'Select Jetty Server';

export const selectJettyDirectory: string = "Select Jetty Directory";

export const deleteConfirm: string = 'This Jetty Server is running, are you sure you want to delete it?';

export enum ServerState {
    RunningServer = 'runningserver',
    IdleServer = 'idleserver'
};