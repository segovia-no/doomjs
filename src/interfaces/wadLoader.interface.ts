export interface WADHeader {
  wadType: string;
  directoryEntries: number;
  directoryOffset: number;
}

export interface WADDirectory {
  lumpOffset: number;
  lumpSize: number;
  lumpName: string;
}