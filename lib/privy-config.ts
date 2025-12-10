/**
 * Check if Privy is properly configured with a valid API key
 * Valid Privy app IDs start with 'clp'
 */
export function isPrivyConfigured(): boolean {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_API_KEY;
  return !!(privyAppId && privyAppId.trim() !== '' && privyAppId.startsWith('clp'));
}
