import { CommonBase } from './common-base';

export interface CurseDownloadMeta {
  projectId: number,
  fileId: number,
  url: string
}

export class CurseDownloads extends CommonBase {
  downloads: CurseDownloadMeta[] = [];

  constructor(public readonly minecraftVersion: string) {
    super();
  }
}
