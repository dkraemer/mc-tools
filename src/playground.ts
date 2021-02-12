import { CurseForge } from './curse-forge/curse-forge';
import { AddonFileInfo } from './curse-forge/responses/AddonFileInfo';
import { AddonInfo } from './curse-forge/responses/AddonInfo';
import { McToolsBase } from './mc-tools';
// Unable to download file metadata for projectID:'69162' fileID:'2716100'

class Playground extends McToolsBase {
  private static hasInstance = false;

  public static main(): void {
    if (this.hasInstance) {
      return;
    }

    this.hasInstance = true;
    const instance = new Playground();
    instance.main().then(() => {
      instance.exit();
    });
  }

  private async main(): Promise<void> {

    let response: AddonFileInfo;
    try {
      // 272514/file/2920596
      response = await CurseForge.getAddonFileInfo(272514, 2920596);

    } catch (error) {
      throw error;
    }

    const str = JSON.stringify(response, null, 2)
    console.log(response);


    return;
  }

}

Playground.main();
