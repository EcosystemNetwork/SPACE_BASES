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

/**
 * Check if mock authentication mode is enabled
 * 
 * When enabled, the app uses mock authentication instead of real Privy integration.
 * This allows development without requiring valid Privy credentials.
 * 
 * Set NEXT_PUBLIC_MOCK_AUTH=true in .env to enable mock mode.
 * 
 * @returns true if mock authentication is enabled
 */
export function isMockAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';
}
