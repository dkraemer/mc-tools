import { Addon } from './responses/Addon';

export class CurseForgeUtils {
  public static sortByName(addons: Addon[]): Addon[] {
    return addons.sort((a, b) => {
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
