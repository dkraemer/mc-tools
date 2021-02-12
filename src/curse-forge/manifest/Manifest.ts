import { CommonBase } from '../../CommonBase';
import { FileManifest, validateFileManifests } from './FileManifest';
import { MinecraftManifest } from './MinecraftManifest';

export class Manifest extends CommonBase {
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
}

export function validateManifest(manifest: Manifest): boolean {
  return (manifest !== undefined)
    && (manifest.minecraft !== undefined)
    && (typeof manifest.minecraft.version === 'string')
    && (manifest.minecraft.modLoaders)
    && (manifest.minecraft.modLoaders instanceof Array)
    && (manifest.minecraft.modLoaders.length > 0)
    && (typeof manifest.minecraft.modLoaders[0].id === 'string')
    && (typeof manifest.minecraft.modLoaders[0].primary === 'boolean')
    && (typeof manifest.manifestType === 'string')
    && (typeof manifest.manifestVersion === 'number')
    && (typeof manifest.name === 'string')
    && (typeof manifest.version === 'string')
    && (typeof manifest.author === 'string')
    && (manifest.files)
    && (manifest.files instanceof Array)
    && (manifest.files.length > 0)
    && validateFileManifests(manifest.files)
    && (typeof manifest.overrides === 'string');
}
