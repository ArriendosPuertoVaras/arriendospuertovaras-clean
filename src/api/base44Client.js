import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "6896de9af377ff13da44d431", 
  requiresAuth: true // Ensure authentication is required for all operations
});
