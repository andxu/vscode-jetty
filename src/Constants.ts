'use strict';

import { MessageItem } from "vscode";

export enum ServerState {
    RunningServer = 'runningserver',
    IdleServer = 'idleserver'
}

export namespace DialogMessage {
    export const yes: MessageItem = { title: 'Yes' };
    export const no: MessageItem = { title: 'No', isCloseAffordance: true };
    export const cancel: MessageItem = { title: 'Cancel', isCloseAffordance: true };
    export const deleteConfirm: string = 'This Jetty Server is running, are you sure you want to delete it?';
}