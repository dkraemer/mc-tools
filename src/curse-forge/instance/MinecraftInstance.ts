import { MinecraftInstalledAddon } from './MinecraftInstalledAddon';

export interface MinecraftInstance {
  baseModLoader: {
    name: string;
  };
  name: string;
  gameVersion: string;
  installedAddons: MinecraftInstalledAddon[];
}
