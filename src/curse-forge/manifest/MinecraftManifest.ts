import { ModLoaderManifest } from './ModLoaderManifest';

export interface MinecraftManifest {
  version: string;
  modLoaders: ModLoaderManifest[];
}
