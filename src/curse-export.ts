import * as fs from 'fs';
import * as path from 'path';
import { program } from 'commander';
import { McToolsBase } from './mc-tools';
import { MinecraftInstance } from './curse-minecraft-instance';
import { Manifest } from './curse-manifest';
import { CommonBase } from './common-base';

interface ProgramOptions {
  instanceDir: string,
  author: string,
  version: string,
  overrides: string[] | undefined,
  force: boolean,
  debug: boolean
}

interface Configuration {
  args: string[]
}

export class CurseExport extends McToolsBase {
  private static hasInstance = false;

  public static main(): void {
    if (this.hasInstance) {
      return;
    }

    this.hasInstance = true;
    new CurseExport().privateMain();
  }

  private constructor() {
    super();
  }

  private async setupOptions(scriptName: string, argvRaw: string[]): Promise<ProgramOptions> {

    let argv = argvRaw;

    // Use an optional configuration file providing the arguments
    if (process.env.MC_CURSE_EXPORT_CONFIG) {
      const configFile = process.env.MC_CURSE_EXPORT_CONFIG;
      if (fs.existsSync(configFile)) {
        await (import(configFile) as Promise<Configuration>)
          .then(config => {
            argv = argvRaw.slice(0, 2).concat(config.args);
            console.warn(`[WARNING]: Ignoring commandline arguments. Using ${configFile}`);
          })
          .catch(() => {
            CommonBase.errorExit(`Unable to load ${configFile}`);
          });
      }
    }

    // Commander setup
    program
      .name(scriptName)
      .description('Exports a CurseForge minecraft instance')
      .requiredOption('-i, --instance-dir <directory>', 'Path to CurseForge instance directory (required)')
      .requiredOption('-a, --author <author>', 'Set the author of this modpack (required)')
      .requiredOption('-v, --version <version>', 'Set version of this modpack (required)')
      .option('-o, --overrides <paths...>', 'A list of directories and/or files inside the instance directory to include as overrides')
      .option('-f, --force', 'Overwrites existing output files', false)
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

  private async privateMain(): Promise<void> {
    const scriptName = this.scriptPrefix + path.basename(__filename, '.js');
    const options = await this.setupOptions(scriptName, process.argv);

    const instanceJsonPath = path.join(options.instanceDir, 'minecraftinstance.json');
    CommonBase.pathMustExist(instanceJsonPath);

    await (import(instanceJsonPath) as Promise<MinecraftInstance>)
      .then(mci => {
        const manifest = new Manifest();
        manifest.minecraft = {
          version: mci.gameVersion,
          modLoaders: [{
            id: mci.baseModLoader.name,
            primary: true
          }]
        };
        manifest.name = mci.name;
        manifest.version = options.version;
        manifest.author = options.author;

        manifest.writeFile('test.json', options.force);
      })
      .catch(() => {
        CommonBase.errorExit(`Unable to load ${instanceJsonPath}`);
      });
  }
}
