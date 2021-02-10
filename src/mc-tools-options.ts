import { CurseExportOptions, validateCurseExportOptions } from './curse-export-options';
export interface McToolsOptions {
  export: CurseExportOptions
}

export function validateMcToolsOptions(options: McToolsOptions): boolean {
  return options.export
    && validateCurseExportOptions(options.export);
}
