import got from 'got';
import { AddonFileInfo } from './responses/AddonFileInfo';
import { AddonInfo } from './responses/AddonInfo';

export class CurseForge {
  private static readonly apiBaseUrl = 'https://addons-ecs.forgesvc.net/api/v2/addon/';

  public static async callApi<T>(endPoint: string): Promise<T> {
    const response = await got<T>(this.apiBaseUrl + endPoint, { responseType: 'json' });
    return response.body;
  }

  public static async getAddonInfo(addonID: number): Promise<AddonInfo> {
    return await this.callApi(`${addonID}`);
  }

  public static async getAddonInfos(addonIDs: number[]): Promise<AddonInfo[]> {

    const response = await got.post<AddonInfo[]>(this.apiBaseUrl, {
      body: `[${addonIDs.join(',')}]`,
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.body;
  }

  public static async getAddonFileInfo(addonID: number, fileID: number): Promise<AddonFileInfo> {
    return await this.callApi(`${addonID}/file/${fileID}`);
  }
}
