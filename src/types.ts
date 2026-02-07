export interface FilePatternMatch {
    filePath: string;
    count: number;
    line?: number;
    column?: number;
}

export interface RepositoryMetrics {
    consoleLogDensity: number;
    todoFixmeDensity: number;
    averageFileSize: number;
    largeFileCount: number;
    detectedLanguages: string[];

    // Environment files
    envFiles: {
        hasEnv: boolean;
        hasEnvExample: boolean;
        hasEnvLocal: boolean;
        hasEnvStaging: boolean;
        hasEnvProd: boolean;
        foundFiles: string[];
    };

    // Dockerfile Patterns
    dockerfileInstructionCasing: 'uppercase' | 'lowercase' | 'mixed' | 'none';

    // Naming Conventions (JS/TS specific)
    namingConvention: 'camelCase' | 'snake_case' | 'mixed' | 'none';

    // Detailed patterns
    filesWithLogs: FilePatternMatch[];
    filesWithTodos: FilePatternMatch[];
}

export interface BaselineData {
    version: string;
    updatedAt: string;
    metrics: RepositoryMetrics;
}

export const BASELINE_FILE_PATH = '.ready2merge/baseline.json';
