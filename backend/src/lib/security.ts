import { isIP } from 'net';

/**
 * Validates and ensures URLs are strictly outbound public HTTP/HTTPS endpoints,
 * rejecting SSRF attacks targeting localhost, AWS/cloud metadata, and private networks.
 */
export function isAllowedUrl(inputUrl: string): boolean {
  if (!inputUrl || typeof inputUrl !== 'string') return false;

  try {
    const parsed = new URL(inputUrl);

    // Strictly enforce http or https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Reject loopback, localhost, and cloud metadata hostnames
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0.0.0.0' ||
      hostname === '169.254.169.254' || // AWS / GCP / Azure metadata endpoint
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return false;
    }

    // Reject IP addresses targeting private subnets (RFC 1918 / RFC 3927)
    if (isIP(hostname)) {
      if (
        hostname.startsWith('10.') ||
        hostname.startsWith('127.') ||
        hostname.startsWith('169.254.') ||
        hostname.startsWith('192.168.') ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
      ) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}
