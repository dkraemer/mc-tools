import os from 'os';
import path from 'path';
import { existsSync, mkdtempSync, rm } from 'fs';

export abstract class McToolsBase {
  private static readonly tempDirPrefix = 'mc-tools-';
  public readonly tempDir: string = '';
  protected readonly scriptPrefix = 'mc-';
  protected debugMode = false;

  protected constructor() {
    const tempDirPrefix = path.join(os.tmpdir(), McToolsBase.tempDirPrefix);
    try {
      this.tempDir = mkdtempSync(tempDirPrefix);
    } catch (error) {
      this.exit(error);
    }
  }

  public exit(error: Error | string | void): void {
    let returnCode = 0;

    if (error) {
      const msg = (error instanceof Error) ? error.message : error;
      console.error(`[ERROR]: ${msg}`);
      returnCode = 1;
    }

    rm(this.tempDir, { recursive: true }, () => {
      process.exit(returnCode);
    });
  }

  public pathMustExist(pathToCheck: string): void {
    if (!existsSync(pathToCheck)) {
      this.exit(`Path not found '${pathToCheck}'`);
    }
  }
}
