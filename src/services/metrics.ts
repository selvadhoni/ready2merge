import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { RepositoryMetrics, FilePatternMatch } from '../types';

export class MetricsEngine {
    static async scanRepository(): Promise<RepositoryMetrics> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder found');
        }

        const rootPath = workspaceFolders[0].uri.fsPath;

        // Exclude common build artifacts, dependencies, and internal folders
        const excludePattern = '{**/node_modules/**,**/.next/**,**/dist/**,**/build/**,**/out/**,**/.git/**,**/.vscode/**,**/coverage/**,**/.ready2merge/**}';

        const files = await vscode.workspace.findFiles('**/*', excludePattern);

        let totalLines = 0;
        let totalConsoleLogs = 0;
        let totalTodos = 0;
        let totalSize = 0;
        let largeFiles = 0;
        const languages = new Set<string>();

        let dockerUpper = 0;
        let dockerLower = 0;

        let camelCount = 0;
        let snakeCount = 0;

        const filesWithLogs: FilePatternMatch[] = [];
        const filesWithTodos: FilePatternMatch[] = [];

        const dockerInstructions = /^(FROM|RUN|COPY|ADD|WORKDIR|EXPOSE|CMD|ENTRYPOINT|ENV|ARG|LABEL|USER|VOLUME|STOPSIGNAL|HEALTHCHECK|ONBUILD)\s/i;

        // Simple regex for variable/function declarations in JS/TS/Python
        const declarationRegex = /\b(const|let|var|function|def|class)\s+([a-zA-Z0-9_$]+)/g;

        for (const file of files) {
            const stats = fs.statSync(file.fsPath);
            if (stats.isDirectory()) continue;

            const relativePath = path.relative(rootPath, file.fsPath);
            const fileName = path.basename(file.fsPath);
            const ext = path.extname(file.fsPath).slice(1).toLowerCase();
            if (ext) languages.add(ext);

            totalSize += stats.size;
            if (stats.size > 5 * 1024 * 1024) largeFiles++;

            if (this.isTextFile(file.fsPath)) {
                try {
                    const content = fs.readFileSync(file.fsPath, 'utf-8');
                    const lines = content.split('\n');
                    totalLines += lines.length;

                    // Naming convention check for source code
                    if (['ts', 'js', 'tsx', 'jsx', 'py'].includes(ext)) {
                        let match;
                        declarationRegex.lastIndex = 0;
                        while ((match = declarationRegex.exec(content)) !== null) {
                            const name = match[2];
                            if (name.includes('_')) snakeCount++;
                            else if (/[a-z]+[A-Z]/.test(name)) camelCount++;
                        }
                    }

                    // Dockerfile casing check
                    if (fileName.toLowerCase().includes('dockerfile')) {
                        for (const line of lines) {
                            const trimmed = line.trim();
                            const match = trimmed.match(dockerInstructions);
                            if (match) {
                                const instr = match[1];
                                if (instr === instr.toUpperCase()) dockerUpper++;
                                else if (instr === instr.toLowerCase()) dockerLower++;
                            }
                        }
                    }

                    const logRegex = /console\.log|print\(/g;
                    const todoRegex = /TODO|FIXME/g;

                    const logMatches = (content.match(logRegex) || []).length;
                    const todoMatches = (content.match(todoRegex) || []).length;

                    if (logMatches > 0) {
                        totalConsoleLogs += logMatches;
                        // Find first line and column with a log
                        let firstLine = 1;
                        let firstCol = 1;
                        const logTestRegex = /console\.log|print\(/;
                        for (let i = 0; i < lines.length; i++) {
                            const match = lines[i].match(logTestRegex);
                            if (match) {
                                firstLine = i + 1;
                                firstCol = match.index ? match.index + 1 : 1;
                                break;
                            }
                        }
                        filesWithLogs.push({ filePath: relativePath, count: logMatches, line: firstLine, column: firstCol });
                    }

                    if (todoMatches > 0) {
                        totalTodos += todoMatches;
                        // Find first line and column with a TODO
                        let firstLine = 1;
                        let firstCol = 1;
                        const todoTestRegex = /TODO|FIXME/;
                        for (let i = 0; i < lines.length; i++) {
                            const match = lines[i].match(todoTestRegex);
                            if (match) {
                                firstLine = i + 1;
                                firstCol = match.index ? match.index + 1 : 1;
                                break;
                            }
                        }
                        filesWithTodos.push({ filePath: relativePath, count: todoMatches, line: firstLine, column: firstCol });
                    }
                } catch (e) {
                    // Skip files that can't be read
                }
            }
        }

        // Determine Docker casing preference
        let dockerPreference: 'uppercase' | 'lowercase' | 'mixed' | 'none' = 'none';
        if (dockerUpper > 0 || dockerLower > 0) {
            const total = dockerUpper + dockerLower;
            if (dockerUpper / total > 0.9) dockerPreference = 'uppercase';
            else if (dockerLower / total > 0.9) dockerPreference = 'lowercase';
            else dockerPreference = 'mixed';
        }

        // Determine Naming Preference
        let namingPreference: 'camelCase' | 'snake_case' | 'mixed' | 'none' = 'none';
        if (camelCount > 0 || snakeCount > 0) {
            const total = camelCount + snakeCount;
            if (camelCount / total > 0.8) namingPreference = 'camelCase';
            else if (snakeCount / total > 0.8) namingPreference = 'snake_case';
            else namingPreference = 'mixed';
        }

        // Expanded Environment File Check
        const envPatterns = [
            '.env', '.env.local', '.env.development', '.env.staging',
            '.env.production', '.env.qa', '.env.example', '.env.template'
        ];

        const foundEnvFiles: string[] = [];
        for (const pattern of envPatterns) {
            if (fs.existsSync(path.join(rootPath, pattern))) {
                foundEnvFiles.push(pattern);
            }
        }

        return {
            consoleLogDensity: totalLines > 0 ? (totalConsoleLogs / totalLines) * 1000 : 0,
            todoFixmeDensity: totalLines > 0 ? (totalTodos / totalLines) * 1000 : 0,
            averageFileSize: files.length > 0 ? totalSize / files.length : 0,
            largeFileCount: largeFiles,
            detectedLanguages: Array.from(languages),
            envFiles: {
                hasEnv: foundEnvFiles.some(f => f === '.env' || f.includes('.env.') && !f.includes('example') && !f.includes('template')),
                hasEnvExample: foundEnvFiles.some(f => f.includes('example') || f.includes('template')),
                hasEnvLocal: foundEnvFiles.includes('.env.local'),
                hasEnvStaging: foundEnvFiles.includes('.env.staging'),
                hasEnvProd: foundEnvFiles.includes('.env.production'),
                foundFiles: foundEnvFiles
            },
            dockerfileInstructionCasing: dockerPreference,
            namingConvention: namingPreference,
            filesWithLogs: filesWithLogs.sort((a, b) => b.count - a.count),
            filesWithTodos: filesWithTodos.sort((a, b) => b.count - a.count)
        };
    }

    private static isTextFile(filePath: string): boolean {
        // Exclude common binary/asset extensions
        const binaryExtensions = ['png', 'jpg', 'jpeg', 'gif', 'ico', 'pdf', 'zip', 'exe', 'dll', 'so', 'map'];
        const ext = path.extname(filePath).slice(1).toLowerCase();
        if (!ext) return true; // Files without extension might be text (e.g., Dockerfile)
        return !binaryExtensions.includes(ext);
    }
}
