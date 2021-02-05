export interface MinecraftInstalledAddon {
  addonID: number,
  installedFile: {
    id: number
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
