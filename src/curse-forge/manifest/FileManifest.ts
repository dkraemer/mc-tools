export interface FileManifest {
  projectID: number;
  fileID: number;
  required: boolean;
}

export function validateFileManifests(fileManifests: FileManifest[]): boolean {
  for (const file of fileManifests) {
    if (typeof file.projectID !== 'number') {
      return false;
    }
    if (typeof file.fileID !== 'number') {
      return false;
    }
    if (typeof file.required !== 'boolean') {
      return false;
    }
  }
  return true;
}
