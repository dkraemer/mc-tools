import os from 'os';
import path from 'path';
import * as fs from 'fs-extra';

export abstract class McToolsBase {
  private static readonly tempDirPrefix = 'mc-tools-';
  public readonly tempDir: string = '';
  protected readonly scriptPrefix = 'mc-';
  protected debugMode = false;

  protected constructor() {
    const tempDirPrefix = path.join(os.tmpdir(), McToolsBase.tempDirPrefix);
    this.tempDir = fs.mkdtempSync(tempDirPrefix);
  }

  public exit(error: Error | string | void): void {
    let returnCode = 0;

    if (error) {
      const msg = (error instanceof Error) ? error.message : error;
      console.error(`[ERROR]: ${msg}`);
      returnCode = 1;
    }

    fs.removeSync(this.tempDir);
    process.exit(returnCode);
  }

  public assertPathSync(pathToCheck: string): void {
    if (!fs.existsSync(pathToCheck)) {
      this.exit(`Path not found '${pathToCheck}'`);
    }
  }
}
