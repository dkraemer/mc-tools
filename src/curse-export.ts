import * as fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { writeFile } from 'fs/promises';
import { Command } from 'commander';
import { McToolsBase } from './mc-tools';
import { CurseExportOptions } from './curse-export-options';
import { MinecraftInstalledAddon, MinecraftInstance } from './curse-minecraft-instance';
import { FileManifest, Manifest } from './curse-manifest';
import { CurseDownloadMeta, CurseDownloads } from './curse-downloads';

export class CurseExport extends McToolsBase {
  private static hasInstance = false;
  private readonly scriptName: string;
  private options: CurseExportOptions = {
    instanceDir: '',
    author: '',
    version: ''
  };

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

  constructor() {
    super();
    this.scriptName = this.scriptPrefix + path.basename(__filename, '.js');
  }

  private parseOptions(): void {
    // Command-line arguments absent and optionsfile is present.
    if (process.argv.length === 2 && this.fileOptions) {
      this.options = this.fileOptions.export;
      return;
    }

    // Commander setup
    const program = new Command();
    program
      .name(this.scriptName)
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
  $ ${this.scriptName} -i C:\\CurseForge\\Instances\\MyModpack -a omgPacks -v 0.0.1-alpha -o config -o scripts -o options.txt

  What it does:
    - Exports the CurseForge Minecraft instance in C:\\CurseForge\\Instances\\MyModpack
    - Sets omgPacks as modpack author
    - Sets 0.0.1-alpha as modpack version
    - Copies the directory C:\\CurseForge\\Instances\\MyModpack\\config\\exampleMod to overrides\\config\\exampleMod
    - Copies the directory C:\\CurseForge\\Instances\\MyModpack\\scripts to overrides\\scripts
    - Copies the file C:\\CurseForge\\Instances\\MyModpack\\options.txt to overrides\\options.txt
    - Creates a ZIP archive containing a manifest and the overrides directory
  `)
      .parse(process.argv);

    this.options = program.opts() as CurseExportOptions;
  } // End of parseOptions()

  private async importMinecraftInstance(): Promise<MinecraftInstance> {
    const instanceJsonPath = path.join(this.options.instanceDir, 'minecraftinstance.json');
    this.assertPathSync(instanceJsonPath);

    try {
      return await (import(instanceJsonPath) as Promise<MinecraftInstance>);
    } catch (error) {
      this.exit(`Unable to load ${instanceJsonPath}`);
      throw error; // Unreachable code, but ts complains otherwise
    }
  } // End of importMinecraftInstance()

  private async exportMainfest(mci: MinecraftInstance, manifestPath: string): Promise<Manifest> {
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
    manifest.version = this.options.version;
    manifest.author = this.options.author;

    manifest.files =
      mci.installedAddons
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
      await writeFile(manifestPath, manifest.stringify(), { flag: this.options.force ? 'w' : 'wx' });
    } catch (error) {
      this.exit(error);
    }

    return manifest;
  } // End of exportMainfest()

  private async exportDownloadUrls(mci: MinecraftInstance, downloadsFilePath: string): Promise<void> {
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
      await writeFile(downloadsFilePath, curseDownloads.stringify(), { flag: this.options.force ? 'w' : 'wx' });
    } catch (error) {
      this.exit(error);
    }

  } // End of exportDownloadUrls()

  private async copyOverrides(overridesPath: string): Promise<void> {
    // Create overrides dir always
    fs.ensureDirSync(overridesPath);

    if (!this.options.overrides) {
      return;
    }

    for (const override of this.options.overrides) {
      const srcPath = path.join(this.options.instanceDir, override);
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

  private async createZipFile(manifest: Manifest, manifestPath: string, overridesPath: string): Promise<string> {
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

    if (this.options.overrides) {
      archive.directory(overridesPath, manifest.overrides);
    } else {
      // Create empty overrides directory entry
      // See: https://github.com/archiverjs/node-archiver/issues/52#issuecomment-39236148
      archive.append('', { name: path.join(manifest.overrides, path.sep) });
    }
    await archive.finalize();

    return zipFilePath;
  } // End of createZipFileSync()

  private async privateMain(): Promise<void> {

    // Get options
    this.parseOptions();

    // Set debug mode for various methods
    this.debugMode = this.options.debug;

    // Instance directory must exist
    this.assertPathSync(this.options.instanceDir);

    // Read minecraftinstance.json
    const mci = await this.importMinecraftInstance();

    // Create manifest.json
    const manifestPath = path.join(this.tempDir, this.manifestFilename);
    const manifest = await this.exportMainfest(mci, manifestPath);

    // Copy files to overrides directory
    const overridesPath = path.join(this.tempDir, manifest.overrides);
    await this.copyOverrides(overridesPath);

    // Create downloads JSON on demand
    if (this.options.urls) {
      this.assertPathNotExistSync(this.curseDownloadsFilename, this.options.force);
      await this.exportDownloadUrls(mci, this.curseDownloadsFilename);
    }

    if (!this.options.zip) {
      // Create no ZIP, just copy stuff to current working directory
      this.assertPathNotExistSync(this.manifestFilename, this.options.force);
      this.assertPathNotExistSync(manifest.overrides, this.options.force);

      try {
        fs.ensureDirSync(manifest.overrides);
        await fs.copy(manifestPath, this.manifestFilename, { overwrite: this.options.force });
        await fs.copy(overridesPath, manifest.overrides, { overwrite: this.options.force });
      } catch (error) {
        this.exit(error);
      }
    } else {
      // Create ZIP
      const zipFilePath = await this.createZipFile(manifest, manifestPath, overridesPath);
      const zipFilename = path.basename(zipFilePath);

      this.assertPathNotExistSync(zipFilename, this.options.force);

      try {
        await fs.move(zipFilePath, zipFilename, { overwrite: this.options.force });
      } catch (error) {
        this.exit(error);
      }
    }
  } // End of privateMain()
} // End of class CurseExport
