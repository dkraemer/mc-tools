import { McToolsExportOptions, validateMcToolsExportOptions } from './McToolsExportOptions';

export interface McToolsOptions {
  export: McToolsExportOptions
}

export function validateMcToolsOptions(options: McToolsOptions): boolean {
  return options.export
    && validateMcToolsExportOptions(options.export);
}
