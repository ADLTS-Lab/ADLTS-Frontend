export function isLocalFallbackEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK === 'true';
}
