export interface MinecraftVersion {
  id: number;
  gameVersionId: number;
  versionString: string;
  jarDownloadUrl: string;
  jsonDownloadUrl: string;
  approved: boolean;
  dateModified: Date;
  gameVersionTypeId: number;
  gameVersionStatus: number;
  gameVersionTypeStatus: number;
}
