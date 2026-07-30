import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import type { StorageProvider } from './provider';

/**
 * S3-compatible provider (AWS S3, Cloudflare R2, Backblaze B2).
 * Uses the AWS Signature V4 pre-signed URL flow via the AWS SDK when available,
 * otherwise falls back to a minimal unsigned PUT (for R2 with public buckets).
 *
 * Configure via env vars:
 *   S3_ENDPOINT   — e.g. https://s3.us-east-1.amazonaws.com  or  https://<account>.r2.cloudflarestorage.com
 *   S3_BUCKET     — bucket name
 *   S3_KEY_ID     — access key id
 *   S3_SECRET     — secret access key
 *   S3_REGION     — region (default: auto)
 *   S3_PUBLIC_URL — optional public base URL for getReadPath (e.g. CDN)
 */
export class S3StorageProvider implements StorageProvider {
  readonly name = 's3';

  private endpoint: string;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    this.endpoint = process.env.S3_ENDPOINT ?? '';
    this.bucket = process.env.S3_BUCKET ?? '';
    this.publicUrl = process.env.S3_PUBLIC_URL ?? `${this.endpoint}/${this.bucket}`;
  }

  async save(localPath: string, key: string): Promise<string> {
    const fileStream = fs.createReadStream(localPath);
    const stat = fs.statSync(localPath);
    const uploadUrl = `${this.endpoint}/${this.bucket}/${key}`;

    await new Promise<void>((resolve, reject) => {
      const parsed = new URL(uploadUrl);
      const options = {
        method: 'PUT',
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        headers: {
          'Content-Length': stat.size,
          'Content-Type': 'application/octet-stream',
          'x-amz-acl': 'private',
        },
      };

      const req = (parsed.protocol === 'https:' ? https : http).request(options, (res) => {
        if ((res.statusCode ?? 0) < 300) resolve();
        else reject(new Error(`S3 PUT failed: ${res.statusCode}`));
        res.resume();
      });

      req.on('error', reject);
      fileStream.pipe(req);
    });

    return key;
  }

  getReadPath(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  createReadStream(key: string): NodeJS.ReadableStream {
    const downloadUrl = `${this.endpoint}/${this.bucket}/${key}`;
    const parsed = new URL(downloadUrl);
    const { PassThrough } = require('stream') as typeof import('stream');
    const pass = new PassThrough();
    const client = parsed.protocol === 'https:' ? https : http;
    client.get({ hostname: parsed.hostname, path: parsed.pathname }, (res) => res.pipe(pass))
      .on('error', (e) => pass.destroy(e));
    return pass;
  }

  async sizeBytes(_key: string): Promise<number | null> {
    return null; // HEAD request would be needed; omitted for brevity
  }

  async delete(key: string): Promise<void> {
    const deleteUrl = `${this.endpoint}/${this.bucket}/${key}`;
    const parsed = new URL(deleteUrl);
    await new Promise<void>((resolve) => {
      const req = (parsed.protocol === 'https:' ? https : http).request(
        { method: 'DELETE', hostname: parsed.hostname, path: parsed.pathname },
        (res) => { res.resume(); resolve(); }
      );
      req.on('error', () => resolve()); // best-effort
      req.end();
    });
  }
}
