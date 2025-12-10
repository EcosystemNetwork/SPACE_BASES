/**
 * Check if Privy is properly configured with a valid API key
 * 
 * Note: Valid Privy app IDs start with 'clp' prefix as per Privy's current format.
 * This validation helps catch configuration errors early. If Privy changes their
 * ID format in the future, this check should be updated accordingly.
 * 
 * @returns true if NEXT_PUBLIC_PRIVY_API_KEY is set and appears valid
 */
export function isPrivyConfigured(): boolean {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_API_KEY;
  return !!(privyAppId && privyAppId.trim() !== '' && privyAppId.startsWith('clp'));
}
