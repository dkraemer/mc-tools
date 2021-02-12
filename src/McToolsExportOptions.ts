export interface McToolsExportOptions {
  instanceDir: string,
  author: string,
  version: string,
  overrides?: string[],
  zip?: boolean,
  force?: boolean,
  debug?: boolean
}

export function validateMcToolsExportOptions(options: McToolsExportOptions): boolean {
  return (typeof options.instanceDir === 'string') &&
    (typeof options.author === 'string') &&
    (typeof options.version === 'string');
}
