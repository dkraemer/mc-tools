//import * as fs from 'fs-extra';
import path from 'path';
import { McToolsBase } from './mc-tools';

export class CurseAddonList extends McToolsBase {
  private static hasInstance = false;
  private readonly scriptName: string;

  public static main(): void {
    if (this.hasInstance) {
      return;
    }

    this.hasInstance = true;
    const instance = new CurseAddonList();
    instance.privateMain().then(() => {
      instance.exit();
    });
  }

  constructor() {
    super();
    this.scriptName = this.scriptPrefix + path.basename(__filename, '.js');
  }

  private async privateMain(): Promise<void> {
    console.log();
  }
}
