import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Logger } from './services/logger';
import { BaselineService } from './services/baseline';
import { MetricsEngine } from './services/metrics';

export function activate(context: vscode.ExtensionContext) {
    Logger.init();
    Logger.log('Ready2Merge activated');

    const initCmd = vscode.commands.registerCommand('ready2merge.initializeBaseline', async () => {
        await BaselineService.initialize();
        Logger.show();
    });

    const refreshCmd = vscode.commands.registerCommand('ready2merge.refreshBaseline', async () => {
        await BaselineService.initialize();
        Logger.show();
    });

    const insightsCmd = vscode.commands.registerCommand('ready2merge.repositoryInsights', async () => {
        const baseline = await BaselineService.getBaseline();
        if (!baseline) {
            const selection = await vscode.window.showInformationMessage(
                'Baseline not found. Please initialize it first.',
                'Initialize Baseline'
            );
            if (selection === 'Initialize Baseline') {
                await vscode.commands.executeCommand('ready2merge.initializeBaseline');
            }
            return;
        }

        const m = baseline.metrics;
        Logger.show();
        Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', '🔵');
        Logger.log('                REPOSITORY INSIGHTS (DNA)                    ', '🔵');
        Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', '🔵');

        Logger.log(`Languages: ${m.detectedLanguages.join(', ')}`);
        Logger.log(`Average File Size: ${(m.averageFileSize / 1024).toFixed(2)} KB`);
        Logger.log(`Large Files (>5MB): ${m.largeFileCount}`);

        const rootPath = vscode.workspace.workspaceFolders![0].uri.fsPath;

        Logger.log('------------------------------------------------------------', '🔵');
        Logger.log(`Console Log Density: ${m.consoleLogDensity.toFixed(2)} per 1k lines`);
        if (m.filesWithLogs.length > 0) {
            Logger.log('Files with most console.log/print:');
            m.filesWithLogs.slice(0, 5).forEach(f => {
                const fullPath = path.join(rootPath, f.filePath);
                Logger.log(`  - ${fullPath}:${f.line ?? 1}:${f.column ?? 1} (${f.count} matches)`, '  ');
            });
        }

        Logger.log('------------------------------------------------------------', '🔵');
        Logger.log(`TODO/FIXME Density: ${m.todoFixmeDensity.toFixed(2)} per 1k lines`);
        if (m.filesWithTodos.length > 0) {
            Logger.log('Files with most TODOs/FIXMEs:');
            m.filesWithTodos.slice(0, 5).forEach(f => {
                const fullPath = path.join(rootPath, f.filePath);
                Logger.log(`  - ${fullPath}:${f.line ?? 1}:${f.column ?? 1} (${f.count} matches)`, '  ');
            });
        }

        Logger.log('------------------------------------------------------------', '🔵');
        Logger.log('Environment & Configuration:');
        Logger.log(`Found Env Files: ${m.envFiles.foundFiles.join(', ') || 'None'}`);
        Logger.log(`Default Naming Style: ${m.namingConvention}`);

        if (m.envFiles.hasEnv && !m.envFiles.hasEnvExample) {
            Logger.log('Suggestion: 🟡 Found .env files but no .env.example. Consider adding one for onboarding.', '💡');
        } else if (!m.envFiles.hasEnv) {
            Logger.log('Status: No environment files detected.', '🔵');
        } else {
            Logger.log('Status: Environment patterns look standard.', '🟢');
        }

        Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', '🔵');
    });

    const prCheckCmd = vscode.commands.registerCommand('ready2merge.checkPrReadiness', async () => {
        const baseline = await BaselineService.getBaseline();
        if (!baseline) {
            const selection = await vscode.window.showInformationMessage(
                'Baseline not found. Please initialize it first.',
                'Initialize Baseline'
            );
            if (selection === 'Initialize Baseline') {
                await vscode.commands.executeCommand('ready2merge.initializeBaseline');
            }
            return;
        }

        Logger.show();
        Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', '🔵');
        Logger.log('                 PR READINESS CHECK                         ', '🔵');
        Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', '🔵');

        // Try to get Git changes
        const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
        if (!gitExtension) {
            Logger.log('Git extension not found. Please ensure Git is installed and enabled.', '🟡');
            return;
        }

        const api = gitExtension.getAPI(1);
        const repository = api.repositories[0];
        if (!repository) {
            Logger.log('No Git repository found in the workspace.', '�');
            return;
        }

        const changes = [...repository.state.workingTreeChanges, ...repository.state.indexChanges];
        if (changes.length === 0) {
            Logger.log('No local changes detected in Git.', '🟢');
            return;
        }

        Logger.log(`Analyzing ${changes.length} changed files relative to Project DNA...`, '🔵');
        let anomaliesCount = 0;
        const rootPath = vscode.workspace.workspaceFolders![0].uri.fsPath;

        for (const change of changes) {
            const filePath = change.uri.fsPath;
            const relativePath = path.relative(rootPath, filePath);
            const fileName = path.basename(filePath);

            // Skip non-text or excluded files
            if (filePath.includes('node_modules') ||
                filePath.includes('.next') ||
                filePath.includes('.ready2merge') ||
                filePath.includes('.git')) continue;

            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                const lines = content.split('\n');
                const logCount = (content.match(/console\.log|print\(/g) || []).length;
                const todoCount = (content.match(/TODO|FIXME/g) || []).length;

                const fileLogDensity = lines.length > 0 ? (logCount / lines.length) * 1000 : 0;
                const fileTodoDensity = lines.length > 0 ? (todoCount / lines.length) * 1000 : 0;

                let fileHasIssue = false;
                const baselineMetrics = baseline.metrics;

                // 1. Density Spikes (Logs/TODOs)
                if (fileLogDensity > (baselineMetrics.consoleLogDensity || 0) * 3 && logCount > 0) {
                    // Find first line and column with log
                    let line = 1;
                    let col = 1;
                    for (let i = 0; i < lines.length; i++) {
                        const match = lines[i].match(/console\.log|print\(/);
                        if (match) {
                            line = i + 1;
                            col = (match.index || 0) + 1;
                            break;
                        }
                    }
                    Logger.log(`${filePath}:${line}:${col} - High console.log density (${fileLogDensity.toFixed(2)} vs DNA ${(baselineMetrics.consoleLogDensity || 0).toFixed(2)})`, '🟡');
                    fileHasIssue = true;
                }

                if (fileTodoDensity > (baselineMetrics.todoFixmeDensity || 0) * 3 && todoCount > 0) {
                    let line = 1;
                    let col = 1;
                    for (let i = 0; i < lines.length; i++) {
                        const match = lines[i].match(/TODO|FIXME/);
                        if (match) {
                            line = i + 1;
                            col = (match.index || 0) + 1;
                            break;
                        }
                    }
                    Logger.log(`${filePath}:${line}:${col} - Unusually high TODO count (${fileTodoDensity.toFixed(2)} vs DNA ${(baselineMetrics.todoFixmeDensity || 0).toFixed(2)})`, '🟡');
                    fileHasIssue = true;
                }

                // 2. Dockerfile Casing Drift
                if (fileName.toLowerCase().includes('dockerfile')) {
                    const dockerInstructions = /^(FROM|RUN|COPY|ADD|WORKDIR|EXPOSE|CMD|ENTRYPOINT|ENV|ARG|LABEL|USER|VOLUME|STOPSIGNAL|HEALTHCHECK|ONBUILD)\s/i;
                    let firstViolationLine = 0;
                    let firstViolationCol = 0;
                    let violationType = '';
                    const bCasing = baselineMetrics.dockerfileInstructionCasing || 'none';

                    if (bCasing !== 'none' && bCasing !== 'mixed') {
                        for (let i = 0; i < lines.length; i++) {
                            const match = lines[i].trim().match(dockerInstructions);
                            if (match) {
                                const instr = match[1];
                                const casing = instr === instr.toUpperCase() ? 'uppercase' : 'lowercase';

                                if (casing !== bCasing && firstViolationLine === 0) {
                                    firstViolationLine = i + 1;
                                    firstViolationCol = lines[i].indexOf(instr) + 1;
                                    violationType = casing;
                                }
                            }
                        }
                    }

                    if (firstViolationLine > 0) {
                        Logger.log(`${filePath}:${firstViolationLine}:${firstViolationCol} - Docker casing drift: Found ${violationType} instruction, but repo DNA is ${bCasing}.`, '🟡');
                        fileHasIssue = true;
                    }
                }

                // 3. Naming Convention Drift
                const ext = path.extname(filePath).slice(1).toLowerCase();
                const bNaming = baselineMetrics.namingConvention || 'none';
                if (['ts', 'js', 'tsx', 'jsx', 'py'].includes(ext) && bNaming !== 'none' && bNaming !== 'mixed') {
                    const declarationRegex = /\b(const|let|var|function|def|class)\s+([a-zA-Z0-9_$]+)/g;
                    let firstViolationLine = 0;
                    let firstViolationCol = 0;
                    let violationType = '';

                    for (let i = 0; i < lines.length; i++) {
                        let match;
                        declarationRegex.lastIndex = 0;
                        while ((match = declarationRegex.exec(lines[i])) !== null) {
                            const name = match[2];
                            const style = name.includes('_') ? 'snake_case' : (/[a-z]+[A-Z]/.test(name) ? 'camelCase' : 'neutral');

                            if (style !== 'neutral' && style !== bNaming && firstViolationLine === 0) {
                                firstViolationLine = i + 1;
                                firstViolationCol = match.index + match[1].length + 2;
                                violationType = style;
                            }
                        }
                    }

                    if (firstViolationLine > 0) {
                        Logger.log(`${filePath}:${firstViolationLine}:${firstViolationCol} - Naming drift: Found ${violationType} identifier, but repo DNA is ${bNaming}.`, '🟡');
                        fileHasIssue = true;
                    }
                }

                if (fileHasIssue) {
                    anomaliesCount++;
                } else {
                    Logger.log(`${filePath}:1:1 - Consistent with DNA`, '🟢');
                }

            } catch (e) {
                // Skip unreadable files
            }
        }

        if (anomaliesCount === 0) {
            Logger.log('Summary: All changed files look stable and follow the repo patterns.', '🟢');
        } else {
            Logger.log(`Summary: Found ${anomaliesCount} files with unusual pattern spikes. Review is suggested.`, '🔵');
        }
        Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', '🔵');
    });

    context.subscriptions.push(initCmd, refreshCmd, insightsCmd, prCheckCmd);
}

export function deactivate() { }
