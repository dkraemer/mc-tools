import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';
import { program } from 'commander';
import { McToolsBase } from './mc-tools';
import { MinecraftInstalledAddon, MinecraftInstance } from './curse-minecraft-instance';
import { FileManifest, Manifest } from './curse-manifest';

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
            this.exit(`Unable to load ${configFile}`);
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
      this.debugMode = true;
      console.log(options);
    }

    return options;
  }

  private async privateMain(): Promise<void> {
    const scriptName = this.scriptPrefix + path.basename(__filename, '.js');
    const options = await this.setupOptions(scriptName, process.argv);

    const instanceJsonPath = path.join(options.instanceDir, 'minecraftinstance.json');
    const manifestJsonPath = path.join(this.tempDir, 'manifest.json');
    this.pathMustExist(instanceJsonPath);

    // Create and save the modpack manifest
    await
      (import(instanceJsonPath) as Promise<MinecraftInstance>)
        .then(async mci => {
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
          manifest.files = mci.installedAddons
            .sort((a: MinecraftInstalledAddon, b: MinecraftInstalledAddon) => {
              return a.addonID - b.addonID;
            })
            .map<FileManifest>((addon) => {
              return {
                projectID: addon.addonID,
                fileID: addon.installedFile.id,
                required: true
              };
            });

          await writeFile(manifestJsonPath, manifest.stringify(), { flag: options.force ? 'w' : 'wx' })
            .catch(reason => {
              this.exit(reason as Error);
            });
        }) // End of import.then
        .catch(() => {
          this.exit(`Unable to load ${instanceJsonPath}`);
        });
    this.exit();
  } // End of privateMain()
} // End of class CurseExport
