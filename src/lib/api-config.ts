/**
 * API Configuration for Ironforged Pages
 */

const isDev = import.meta.env.DEV;

export const API_URLS = {
  // Auth service
  AUTH: isDev ? 'http://localhost:8787' : 'https://auth.api.emuy.gg',
  
  // Main API (yume-api) - has clan endpoints
  API: isDev ? 'http://localhost:8792' : 'https://api.emuy.gg',
};

// Iron Forged WOM Group ID (you may need to update this)
export const IRONFORGED_WOM_GROUP_ID = '1234'; // TODO: Update with actual group ID
