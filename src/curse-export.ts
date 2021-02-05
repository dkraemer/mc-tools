import * as fs from 'fs';
import * as path from 'path';
import { program } from 'commander';
import { McTools } from './mc-tools';

interface ProgramOptions {
  instanceDir: string,
  author: string,
  version: string,
  overrides: string[] | undefined,
  debug: boolean
}

interface Configuration {
  args: string[]
}

export class CurseExport {

  private static errorExit(message: string): void {
    console.error(message);
    process.exit(1);
  }

  private static pathMustExist(path: string): void {
    if (!fs.existsSync(path)) {
      this.errorExit(`[ERROR]: Path not found '${path}'`);
    }
  }

  private static setupOptions(scriptName: string, argvRaw: string[]): ProgramOptions {

    let argv = argvRaw;

    // Use an optional configuration file providing the arguments
    if (process.env.MC_CURSE_EXPORT_CONFIG) {
      const configFile = process.env.MC_CURSE_EXPORT_CONFIG
      if (fs.existsSync(configFile)) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const config: Configuration = require(configFile);
        argv = argvRaw.slice(0, 2).concat(config.args);
      }
    }

    // Commander setup
    program
      .name(scriptName)
      .description('Exports a CurseForge minecraft instance')
      .requiredOption('-i, --instance-dir <directory>', 'Path to CurseForge instance directory (required)')
      .requiredOption('-a, --author <author>', 'Set the author of this modpack (required)')
      .requiredOption('-v, --version <version>', 'Set version of this modpack (required)')
      .option('-o, --overrides <paths...>', 'A list of directories and/or files inside the instance directory to include as overrides (optional)')
      .option('-d, --debug', 'Enable debug output of this script', false)
      .helpOption('-h, --help', 'Show this help text')
      .addHelpText('after', `
Example:
  $ ${scriptName} -i C:\\CurseForge\\Instances\\MyModpack -a omgPacks -v 0.0.1-alpha -o config -o scripts -o options.txt

  What it does:
    - Exports the CurseForge Minecraft instance in C:\\CurseForge\\Instances\\MyModpack
    - Sets omgPacks as modpack author
    - Sets 0.0.1-alpha as modpack version
    - Copies the directory C:\\CurseForge\\Instances\\MyModpack\\config\\exampleMod to overrides\\config\\exampleMod
    - Copies the directory C:\\CurseForge\\Instances\\MyModpack\\scripts to overrides\\scripts
    - Copies the file C:\\CurseForge\\Instances\\MyModpack\\options.txt to overrides\\config\\options.txt
  `)
      .parse(argv);

    const options = program.opts() as ProgramOptions;

    if (options.debug) {
      console.log(options);
    }

    return options;
  }

  public static main(): void {
    const scriptName = McTools.COMMAND_PREFIX + path.basename(__filename, '.js');
    CurseExport.setupOptions(scriptName, process.argv);
  }
}
