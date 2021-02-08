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
    fs.removeSync(this.tempDir);

    if (error) {
      const message = (typeof error === 'string' || this.debugMode) ? error : error.message;
      console.error(`[ERROR]: ${message}`);
      process.exit(1);
    }

    process.exitCode = 0;
  }

  public assertPathSync(pathToCheck: string): void {
    if (!fs.existsSync(pathToCheck)) {
      this.exit(`Path not found '${pathToCheck}'`);
    }
  }

  public assertPathNotExistSync(pathToCheck: string, force: boolean): void {
    if (fs.existsSync(pathToCheck) && !force) {
      this.exit(`${pathToCheck} exists and option '--force' was not used`);
    }
  }
}
