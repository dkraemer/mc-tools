import * as fs from 'fs-extra';
import path from 'path';
import { McToolsBase } from './mc-tools';
import { Manifest, validateManifest } from './curse-manifest';
import { CurseForgeCache } from './curse-forge-cache';

export interface CurseAddonListItem {
  name: string,
  summary: string,
  url: string
}

export class CurseAddonList extends McToolsBase {
  private static hasInstance = false;
  private readonly scriptName: string;

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
  }

  private async privateMain(): Promise<void> {
    const manifestPath = path.join(process.cwd(), this.manifestFilename);
    this.assertPathSync(manifestPath);

    let manifest: Manifest;

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      manifest = require(manifestPath);
    } catch (error) {
      this.exit(`Unable to load ${manifestPath}`);
      return; // Unreachable, but ts complains otherwise
    }

    if (!validateManifest(manifest)) {
      this.exit(`Invalid manifest ${manifestPath}`);
    }

    const cachePath = path.join(process.cwd(), '.cfcache.json');

    let cache: CurseForgeCache;

    try {
      if (!fs.existsSync(cachePath)) {
        cache = await CurseForgeCache.generate(cachePath, manifest.files, false,
          (addonName, current, last) => {
            console.log(`Cached metadata for ${addonName} [${current}/${last}]`);
          });
      } else {
        cache = await CurseForgeCache.load(cachePath);
      }
    } catch (error) {
      this.exit(error);
      return; // Unreachable, but ts complains otherwise
    }

    cache
      .getMods()
      .map<CurseAddonListItem>(mod => {
        return {
          name: mod.name,
          summary: mod.summary,
          url: mod.url
        };
      })
      .sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      })
      .forEach(item => {
        // if (item.summary.length >= 50) {
        //   item.summary = item.summary.slice(0, 50).concat('...');
        // }

        console.log(JSON.stringify(item, null, 2));
      });
  }
}
