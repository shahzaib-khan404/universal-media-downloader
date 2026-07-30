export interface StorageProvider {
  /** Persist a local file to the storage backend. Returns the storage key. */
  save(localPath: string, key: string): Promise<string>;

  /** Return a URL or local path usable to read/serve the file. */
  getReadPath(key: string): string;

  /** Stream/pipe the file content to an HTTP reply. */
  createReadStream(key: string): NodeJS.ReadableStream;

  /** Return file size in bytes, or null if unavailable. */
  sizeBytes(key: string): Promise<number | null>;

  /** Delete the stored file. */
  delete(key: string): Promise<void>;

  /** Human-readable name (used in logs). */
  readonly name: string;
}
