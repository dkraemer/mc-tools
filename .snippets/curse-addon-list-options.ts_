export interface CurseAddonListOptions {
  output: string,
  refreshCache: boolean,
  force: boolean,
  debug: boolean
}

export function validateCurseAddonListOptions(this: CurseAddonListOptions): boolean {
  return (typeof this.output === 'string')
    && (typeof this.refreshCache === 'boolean')
    && (typeof this.force === 'boolean')
    && (typeof this.debug === 'boolean');
}
