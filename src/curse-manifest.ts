export interface ModLoaderManifest {
  id: string,
  primary: boolean
}

export interface MinecraftManifest {
  version: string,
  modLoaders: ModLoaderManifest[]
}

export interface FileManifest {
  projectID: number,
  fileID: number,
  required: boolean
}

export class Manifest {
  minecraft: MinecraftManifest = {
    version: '',
    modLoaders: []
  };
  readonly manifestType = 'minecraftModpack';
  readonly manifestVersion = 1;
  name = '';
  version = '';
  author = '';
  files: FileManifest[] = [];
  overrides = 'overrides';

  public stringify(): string {
    return JSON.stringify(this, null, 2);
  }
}
