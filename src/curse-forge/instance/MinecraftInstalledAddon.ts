export interface MinecraftInstalledAddon {
  addonID: number;
  installedFile: {
    id: number;
    downloadUrl: string;
  };
}
