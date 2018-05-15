'use strict';

import { MessageItem } from "vscode";

export const YES: MessageItem = { title: 'Yes' };
export const NO: MessageItem = { title: 'No', isCloseAffordance: true };
export const CANCEL: MessageItem = { title: 'Cancel', isCloseAffordance: true };

export const ADD_SERVER: string = 'Add Jetty Server';
export const SELECT_SERVER: string = 'Select Jetty Server';

export const SELECT_JETTY_DIRECTORY: string = 'Select Jetty Directory';

export const DELETE_CONFIRM: string = 'This Jetty Server is running, are you sure you want to delete it?';

export const SERVER_RUNNING: string = 'This Jetty Server is running.';

export const SERVER_STOPPED: string = 'This Jetty Server is not running.';

export const SELECT_WAR_PACKAGE: string = 'Select War Package';

export const START_SERVER: string = 'The Jetty Server needs to be started before browsing. Would you like to start it now?';

// tslint:disable-next-line:no-http-string
export const LOCALHOST: string = 'http://localhost';

export const HTTP_PORT_UNDEFINED: string = 'http port is undefined in server configuration.';

export const NO_PACKAGE: string = 'The selected package is not under current workspace.';

export const NO_SERVER: string = 'There is no Jetty Servers.';

export const WAR_FILE_EXTENSION: string = '.war';

export const DEBUG_SESSION_NAME: string = 'Jetty Debug (Attach)';

export enum SERVER_STATE {
    RunningServer = 'runningserver',
    IdleServer = 'idleserver'
}
