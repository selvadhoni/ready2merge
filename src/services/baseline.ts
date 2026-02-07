import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { BaselineData, BASELINE_FILE_PATH } from '../types';
import { MetricsEngine } from './metrics';
import { Logger } from './logger';

export class BaselineService {
    static async getBaseline(): Promise<BaselineData | undefined> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return undefined;

        const baselinePath = path.join(workspaceFolders[0].uri.fsPath, BASELINE_FILE_PATH);
        if (fs.existsSync(baselinePath)) {
            const content = fs.readFileSync(baselinePath, 'utf-8');
            return JSON.parse(content);
        }
        return undefined;
    }

    static async initialize(): Promise<void> {
        Logger.log('Initializing repository baseline...');
        const metrics = await MetricsEngine.scanRepository();
        const data: BaselineData = {
            version: '1.0.0',
            updatedAt: new Date().toISOString(),
            metrics
        };

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;

        const baselineDir = path.join(workspaceFolders[0].uri.fsPath, '.ready2merge');
        if (!fs.existsSync(baselineDir)) {
            fs.mkdirSync(baselineDir);
        }

        const baselinePath = path.join(baselineDir, 'baseline.json');
        fs.writeFileSync(baselinePath, JSON.stringify(data, null, 2));
        Logger.log('Baseline initialized and saved to .ready2merge/baseline.json', '🟢');
    }
}
