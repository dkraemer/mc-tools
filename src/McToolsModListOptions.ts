export interface McToolsModListOptions {
  keyfile: string,
  output: string,
  force: boolean,
  debug: boolean
}

export function validateCurseAddonListOptions(this: McToolsModListOptions): boolean {
  return (typeof this.keyfile === 'string')
    && (typeof this.output === 'string')
    && (typeof this.force === 'boolean')
    && (typeof this.debug === 'boolean');
}
