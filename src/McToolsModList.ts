import path from 'path';
import { writeFile, readFile } from 'fs/promises';
import { Command } from 'commander';
import { McToolsBase } from './McToolsBase';
import { McToolsModListOptions } from './McToolsModListOptions';
import { CurseForge } from './curse-forge/CurseForge';
import { CurseForgeUtils } from './curse-forge/CurseForgeUtils';
import { Addon } from './curse-forge/responses/Addon';

export class McToolsModList extends McToolsBase {
  private static hasInstance = false;
  private readonly scriptName: string;
  private readonly manifestPath: string;
  private readonly defaultListFilename = 'MODLIST.md';

  public static main(): void {
    if (this.hasInstance) {
      return;
    }

    this.hasInstance = true;
    const instance = new McToolsModList();
    instance.main().then(() => {
      instance.exit();
    });
  }

  private constructor() {
    super();
    this.scriptName = this.scriptPrefix + path.basename(__filename, '.js');
    this.manifestPath = path.join(process.cwd(), this.manifestFilename);
  }

  public generateGFMList(addons: readonly Addon[]): string {
    return addons
      .map<string>(addon => {
        return `- [x] [${addon.name}](${addon.websiteUrl}) - ${addon.summary}`;
      })
      .join('\n');
  }

  private async main(): Promise<void> {
    const program =
      new Command(this.scriptName)
        .description('Generate a list of mods')
        .requiredOption('-a, --keyfile <path>', 'Path to the CurseForge API key')
        .option('-o, --output <path>', 'Path of file to be written', this.defaultListFilename)
        .option('-f, --force', 'Overwrite existing output', false)
        .option('-d, --debug', 'Enable debug output of this script', false)
        .helpOption('-h, --help', 'Show this help text')
        .parse(process.argv);

    const options = program.opts() as McToolsModListOptions;

    if (options.debug) {
      this.debugMode = true;
      console.debug('McToolsModListOptions:', options);
      console.debug('Source:', this.optionsSource);
    }

    this.assertPathSync(options.keyfile);
    this.assertPathNotExistSync(options.output, options.force);

    const apiKey = await readFile(options.keyfile, {
      encoding: 'utf8',
      flag: 'r'
    });

    const manifest = this.loadManifest(this.manifestPath);
    const addonIDs = manifest.files.map<number>(file => file.projectID);
    const api = new CurseForge(apiKey);
    const addons = await api.getAddonArray(addonIDs);
    const addonsSorted = CurseForgeUtils.sortByName(addons.data);
    const list = this.generateGFMList(addonsSorted);
    const lastUpdated = new Date(Date.now()).toUTCString();

    const content = [
      `# ${manifest.name} Mod List`,
      `Version: ${manifest.version}`,
      `Metadata updated: ${lastUpdated}`,
      `${list}`
    ].join('\n');

    await writeFile(options.output, content, { flag: options.force ? 'w' : 'wx' });
  } // End of private main()
} // End of class McToolsModList
