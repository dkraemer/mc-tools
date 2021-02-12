import { Dependency } from './Dependency';
import { Module } from './Module';

export interface AddonFileInfo {
  id: number;
  displayName: string;
  fileName: string;
  fileDate: Date;
  fileLength: number;
  releaseType: number;
  fileStatus: number;
  downloadUrl: string;
  isAlternate: boolean;
  alternateFileId: number;
  dependencies: Dependency[];
  isAvailable: boolean;
  modules: Module[];
  packageFingerprint: number;
  gameVersion: string[];
  installMetadata?: unknown;
  serverPackFileId?: unknown;
  hasInstallScript: boolean;
  gameVersionDateReleased: Date;
  gameVersionFlavor?: unknown;
}
