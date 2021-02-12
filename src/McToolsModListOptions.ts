export interface McToolsModListOptions {
  output: string,
  force: boolean,
  debug: boolean
}

export function validateCurseAddonListOptions(this: McToolsModListOptions): boolean {
  return (typeof this.output === 'string')
    && (typeof this.force === 'boolean')
    && (typeof this.debug === 'boolean');
}
