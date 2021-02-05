import * as fs from 'fs';

export abstract class McToolsBase {
  protected readonly scriptPrefix = 'mc-';

  protected errorExit(message: string): void {
    console.error(message);
    process.exit(1);
  }

  protected pathMustExist(pathToCheck: string): void {
    if (!fs.existsSync(pathToCheck)) {
      this.errorExit(`[ERROR]: Path not found '${pathToCheck}'`);
    }
  }
}
