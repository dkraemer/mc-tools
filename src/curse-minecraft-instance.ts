export interface MinecraftInstalledAddon {
  addonID: number,
  installedFile: {
    id: number,
    downloadUrl: string
  }
}

export interface MinecraftInstance {
  baseModLoader: {
    name: string
  },
  name: string,
  gameVersion: string
  installedAddons: MinecraftInstalledAddon[]
}
