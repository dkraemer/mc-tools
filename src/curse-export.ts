import * as fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { writeFile } from 'fs/promises';
import { program } from 'commander';
import { McToolsBase } from './mc-tools';
import { MinecraftInstalledAddon, MinecraftInstance } from './curse-minecraft-instance';
import { FileManifest, Manifest } from './curse-manifest';
import { CurseDownloadMeta, CurseDownloads } from './curse-downloads';

interface ProgramOptions {
  instanceDir: string,
  author: string,
  version: string,
  overrides: string[] | undefined,
  zip: boolean,
  urls: boolean,
  force: boolean,
  debug: boolean
}

interface Configuration {
  args: string[]
}

interface ZipFileInfo {
  fullPath: string,
  filename: string
}

export class CurseExport extends McToolsBase {
  private static hasInstance = false;
  private readonly manifestFilename = 'manifest.json';
  private readonly curseDownloadsFilename = 'curse-downloads.json';

  public static main(): void {
    if (this.hasInstance) {
      return;
    }

    this.hasInstance = true;
    const instance = new CurseExport();
    instance.privateMain().then(() => {
      instance.exit();
    });
  }

  private async setupOptions(scriptName: string): Promise<ProgramOptions> {
    let argv = process.argv;

    // Use an optional configuration file providing the arguments
    const configFile = process.env.MC_CURSE_EXPORT_CONFIG;
    if (configFile && fs.existsSync(configFile)) {
      try {
        const config = await (import(configFile) as Promise<Configuration>);
        argv = process.argv.slice(0, 2).concat(config.args);
        console.warn(`[WARNING]: Ignoring commandline arguments. Using ${configFile}`);
      } catch (error) {
        this.exit(`Unable to load ${configFile}`);
      }
    }

    // Commander setup
    program
      .name(scriptName)
      .description('Exports a Overwolf CurseForge (Beta) Minecraft Instance as ZIP archive')
      .requiredOption('-i, --instance-dir <directory>', 'Path to CurseForge instance directory (required)')
      .requiredOption('-a, --author <author>', 'Set the author of this modpack (required)')
      .requiredOption('-v, --version <version>', 'Set version of this modpack (required)')
      .option('-o, --overrides <paths...>', 'A list of directories and/or files inside the instance directory to include as overrides')
      .option('-z, --no-zip', 'Don\'t create a ZIP archive. Place the output files in the current directory')
      .option('-u, --urls', `Save the list of mod download URLs to ${this.curseDownloadsFilename}`, false)
      .option('-f, --force', 'Overwrite existing output files', false)
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
    - Creates a ZIP archive containing a manifest and the overrides directory
  `)
      .parse(argv);

    const options = program.opts() as ProgramOptions;

    if (options.debug) {
      this.debugMode = true;
      console.debug(options);
    }

    return options;
  } // End of setupOptions()

  private async importMinecraftInstance(options: ProgramOptions): Promise<MinecraftInstance> {
    const instanceJsonPath = path.join(options.instanceDir, 'minecraftinstance.json');
    this.assertPathSync(instanceJsonPath);

    try {
      return await (import(instanceJsonPath) as Promise<MinecraftInstance>);
    } catch (error) {
      this.exit(`Unable to load ${instanceJsonPath}`);
      throw error; // Unreachable code, but ts complains otherwise
    }
  } // End of importMinecraftInstance()

  private async exportMainfest(mci: MinecraftInstance, options: ProgramOptions, manifestPath: string): Promise<Manifest> {
    // Create manifest
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


    // Write manifest
    try {
      await writeFile(manifestPath, manifest.stringify(), { flag: options.force ? 'w' : 'wx' });
    } catch (error) {
      this.exit(error);
    }

    return manifest;
  } // End of exportMainfest()

  private async exportDownloadUrls(mci: MinecraftInstance, options: ProgramOptions, downloadsFilePath: string): Promise<void> {
    const curseDownloads = new CurseDownloads(mci.gameVersion);
    curseDownloads.downloads =
      mci.installedAddons
        .sort((a: MinecraftInstalledAddon, b: MinecraftInstalledAddon) => {
          return a.addonID - b.addonID;
        })
        .map<CurseDownloadMeta>(addon => {
          return {
            projectId: addon.addonID,
            fileId: addon.installedFile.id,
            url: addon.installedFile.downloadUrl
          };
        });

    // Write downloads file
    try {
      await writeFile(downloadsFilePath, curseDownloads.stringify(), { flag: options.force ? 'w' : 'wx' });
    } catch (error) {
      this.exit(error);
    }

  } // End of exportDownloadUrls()

  private async copyOverrides(options: ProgramOptions, overridesPath: string): Promise<void> {
    // Create overrides dir always
    fs.ensureDirSync(overridesPath);

    if (!options.overrides) {
      return;
    }

    for (const override of options.overrides) {
      const srcPath = path.join(options.instanceDir, override);
      const dstPath = path.join(overridesPath, override);
      this.assertPathSync(srcPath);
      const srcStat = fs.statSync(srcPath);

      if (srcStat.isDirectory()) {
        fs.ensureDirSync(dstPath);
      }

      try {
        await fs.copy(srcPath, dstPath);
      } catch (error) {
        this.exit(error);
      }
    } // End of for
  } // End of copyOverrides()

  private async createZipFile(manifest: Manifest, manifestPath: string, overridesPath: string): Promise<ZipFileInfo> {
    const archive = archiver('zip');
    const zipFilename = `${manifest.name}-${manifest.version}.zip`;
    const zipFilePath = path.join(this.tempDir, zipFilename);
    const content = fs.createWriteStream(zipFilePath, { flags: 'w', encoding: 'binary' });

    archive.on('warning', error => {
      if (error.code === 'ENOENT') {
        console.warn(error);
      } else {
        this.exit(error);
      }
    });

    archive.on('error', error => {
      this.exit(error);
    });

    archive.pipe(content);
    archive.file(manifestPath, { name: this.manifestFilename });
    archive.directory(overridesPath, manifest.overrides);
    await archive.finalize();

    return {
      filename: zipFilename,
      fullPath: zipFilePath
    };
  } // End of createZipFileSync()

  private async privateMain(): Promise<void> {

    // Parse command-line arguments
    const scriptName = this.scriptPrefix + path.basename(__filename, '.js');
    const options = await this.setupOptions(scriptName);

    // Instance directory must exist
    this.assertPathSync(options.instanceDir);

    // Read minecraftinstance.json
    const mci = await this.importMinecraftInstance(options);

    // Create manifest.json
    const manifestPath = path.join(this.tempDir, this.manifestFilename);
    const manifest = await this.exportMainfest(mci, options, manifestPath);

    // Copy files to overrides directory
    const overridesPath = path.join(this.tempDir, manifest.overrides);
    await this.copyOverrides(options, overridesPath);

    // Create downloads JSON on demand
    if (options.urls) {
      this.assertPathNotExistSync(this.curseDownloadsFilename, options.force);
      await this.exportDownloadUrls(mci, options, this.curseDownloadsFilename);
    }

    // Create ZIP or...
    if (options.zip) {
      const zipFileInfo = await this.createZipFile(manifest, manifestPath, overridesPath);
      this.assertPathNotExistSync(zipFileInfo.filename, options.force);

      try {
        await fs.move(zipFileInfo.fullPath, zipFileInfo.filename, { overwrite: options.force });
      } catch (error) {
        this.exit(error);
      }

      // Exits the script
      return;

    } // End of if(options.zip)

    // ...create no ZIP, just copy stuff to current working directory
    this.assertPathNotExistSync(this.manifestFilename, options.force);
    this.assertPathNotExistSync(manifest.overrides, options.force);

    try {
      fs.ensureDirSync(manifest.overrides);
      await fs.copy(manifestPath, this.manifestFilename, { overwrite: options.force });
      await fs.copy(overridesPath, manifest.overrides, { overwrite: options.force });
    } catch (error) {
      this.exit(error);
    }
  } // End of privateMain()
} // End of class CurseExport
