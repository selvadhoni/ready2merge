import * as vscode from 'vscode';

export class Logger {
    private static channel: vscode.OutputChannel;

    static init() {
        if (!this.channel) {
            this.channel = vscode.window.createOutputChannel('Ready2Merge');
        }
    }

    static log(message: string, prefix: string = '🔵') {
        this.init();
        const timestamp = new Date().toLocaleTimeString();
        this.channel.appendLine(`[${timestamp}] ${prefix} ${message}`);
    }

    static show() {
        this.init();
        this.channel.show(true);
    }
}
