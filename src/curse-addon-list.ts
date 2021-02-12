import * as fs from 'fs-extra';
import path from 'path';
import { writeFile } from 'fs/promises';
import { McToolsBase } from './mc-tools';
import { Manifest, validateManifest } from './curse-manifest';
import { CurseForgeCache } from './curse-forge-cache';
import { NotImplementedError } from './not-implemented-error';
import { CurseAddon, CurseAddonArray } from './curse-addon';
import { Command } from 'commander';
import { CurseAddonListOptions } from './curse-addon-list-options';
import { CurseForge } from './curse-forge/curse-forge';

export class CurseAddonList extends McToolsBase {
  private static hasInstance = false;
  private readonly scriptName: string;
  private readonly manifestPath: string;
  private readonly cacheFilename = '.cfcache.json';
  private readonly cachePath: string;
  private readonly defaultListFilename = 'MODLIST.md';

  public static main(): void {
    if (this.hasInstance) {
      return;
    }

    this.hasInstance = true;
    const instance = new CurseAddonList();
    instance.privateMain().then(() => {
      instance.exit();
    });
  }

  constructor() {
    super();
    this.scriptName = this.scriptPrefix + path.basename(__filename, '.js');
    this.manifestPath = path.join(process.cwd(), this.manifestFilename);
    this.cachePath = path.join(process.cwd(), this.cacheFilename);
  }

  private getManifest(): Manifest {
    this.assertPathSync(this.manifestPath);

    let manifest: Manifest;

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      manifest = require(this.manifestPath);

    } catch (error) {
      this.exit(`Unable to load ${this.manifestPath}`);
      throw new NotImplementedError(); // Unreachable, but ts complains otherwise
    }

    if (!validateManifest(manifest)) {
      this.exit(`Invalid manifest ${this.manifestPath}`);
      throw new NotImplementedError(); // Unreachable, but ts complains otherwise
    }

    return manifest;
  }

  private async getCache(manifest: Manifest, refresh?: boolean): Promise<CurseForgeCache> {
    let cache: CurseForgeCache;

    try {
      if (!fs.existsSync(this.cachePath) || refresh) {
        cache = await CurseForgeCache.generate(this.cachePath, manifest.files, true,
          (addonName, current, last) => {
            console.log(`Cached metadata for ${addonName} [${current}/${last}]`);
          });
      } else {
        cache = await CurseForgeCache.load(this.cachePath);
      }
    } catch (error) {
      this.exit(error);
      throw new NotImplementedError(); // Unreachable, but ts complains otherwise
    }

    return cache;
  }

  private generateListGFM(addons: readonly CurseAddon[]): string {
    return addons
      .map<string>(addon => {
        return `- [x] [${addon.name}](${addon.url}) - ${addon.summary}`;
      })
      .join('\n');
  }

  private async privateMain(): Promise<void> {
    const program =
      new Command(this.scriptName)
        .description('Generate a list of mods')
        .option('-o, --output <path>', 'Path of file to be written', this.defaultListFilename)
        .option('-r, --refresh-cache', 'Refresh local mod metadata cache', false)
        .option('-f, --force', 'Overwrite existing output', false)
        .option('-d, --debug', 'Enable debug output of this script', false)
        .helpOption('-h, --help', 'Show this help text')
        .parse(process.argv);

    const options = program.opts() as CurseAddonListOptions;
    if (options.debug) {
      this.debugMode = true;
    }

    this.assertPathNotExistSync(options.output, options.force);

    const manifest = this.getManifest();

    const addonIDs = manifest.files.map<number>(file => file.projectID);
    const response = await CurseForge.getAddonInfos(addonIDs);

    throw new NotImplementedError();




    return;
    const cache = await this.getCache(manifest, options.refreshCache);
    const mods = cache.getMods();
    const addons = new CurseAddonArray(mods).sortByName();
    const list = this.generateListGFM(addons);
    const lastUpdated = new Date(cache.getLastUpdated() as string);

    const content = [
      `# ${manifest.name} Mod List`,
      `Version: ${manifest.version}`,
      `Metadata updated: ${lastUpdated.toUTCString()}`,
      `${list}`
    ].join('\n');

    await writeFile(options.output, content, { flag: options.force ? 'w' : 'wx' });
  }
}
