export interface CurseExportOptions {
  instanceDir: string,
  author: string,
  version: string,
  overrides?: string[],
  zip?: boolean,
  force?: boolean,
  debug?: boolean
}

export function validateCurseExportOptions(options: CurseExportOptions): boolean {
  return (typeof options.instanceDir === 'string') &&
    (typeof options.author === 'string') &&
    (typeof options.version === 'string');
}
