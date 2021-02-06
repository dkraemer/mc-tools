import * as fs from 'fs';

export abstract class CommonBase {
  public static errorExit(message: string): void {
    console.error(`[ERROR]: ${message}`);
    process.exit(1);
  }

  public static exitOnError(err: Error | null): void {
    if (err) {
      CommonBase.errorExit(err.message);
    }
  }

  public static pathMustExist(pathToCheck: string): void {
    if (!fs.existsSync(pathToCheck)) {
      CommonBase.errorExit(`Path not found '${pathToCheck}'`);
    }
  }

  public stringify(): string {
    return JSON.stringify(this, null, 2);
  }

  public writeFile(filename: string, force = false): void {
    const flag = force ? 'w' : 'wx';
    fs.writeFile(filename, this.stringify(), { flag: flag }, CommonBase.exitOnError);
  }
}
