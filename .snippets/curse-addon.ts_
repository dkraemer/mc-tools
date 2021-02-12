export interface CurseAddon {
  name: string;
  summary: string;
  url: string;
}

export class CurseAddonArray {
  private readonly addons: CurseAddon[];

  public constructor(mods: readonly Mod[]) {
    this.addons = mods
      .map<CurseAddon>(mod => {
        return {
          name: mod.name,
          summary: mod.summary,
          url: mod.url
        };
      });
  }

  public sortByName(): CurseAddon[] {
    return this.addons.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  }
}
