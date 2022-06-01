import got from 'got';
import { Mods } from './responses/Mods';
// import { AddonFile } from './responses/AddonFile';
// import { Addon } from './responses/Addon';
// import { MinecraftModloader } from './responses/MinecraftModloader';
// import { MinecraftVersion } from './responses/MinecraftVersion';

export class CurseForge {
  private static readonly apiBaseUrl = 'https://api.curseforge.com/v1';
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async getAddonArray(addonIDs: number[]): Promise<Mods> {
    const response = await got.post<Mods>(`${CurseForge.apiBaseUrl}/mods`, {
      body: `{"modIDs":[${addonIDs.join(',')}]}`,
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey
      }
    });
    return response.body;
  }

  // public static async callApi<T>(endPoint: string): Promise<T> {
  //   const response = await got<T>(this.apiBaseUrl + endPoint, { responseType: 'json' });
  //   return response.body;
  // }

  // public static async getAddon(addonID: number): Promise<Addon> {
  //   return await this.callApi(`/addon/${addonID}`);
  // }

  // public static async getAddonFile(addonID: number, fileID: number): Promise<AddonFile> {
  //   return await this.callApi(`/addon/${addonID}/file/${fileID}`);
  // }

  // public static async getAddonFileArray(addonID: number): Promise<AddonFile> {
  //   return await this.callApi(`/addon/${addonID}/files`);
  // }

  // public static async getAddonFileDownloadUrl(addonID: number, fileID: number): Promise<string> {
  //   return await this.callApi(`/addon/${addonID}/file/${fileID}/download-url`);
  // }

  // public static async getMinecraftVersion(versionString: string): Promise<MinecraftVersion> {
  //   return await this.callApi(`/minecraft/version/${versionString}`);
  // }

  // public static async getMinecraftVersionArray(): Promise<MinecraftVersion[]> {
  //   return await this.callApi('/minecraft/version');
  // }

  // public static async getMinecraftModloader(versionName: string): Promise<MinecraftModloader> {
  //   return await this.callApi(`/minecraft/modloader/${versionName}`);
  // }

  // public static async getMinecraftModloaderArray(): Promise<MinecraftModloader[]> {
  //   return await this.callApi('/minecraft/modloader');
  // }
}
