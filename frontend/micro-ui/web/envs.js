#!/usr/bin/env node

/**
 * Environment Setup Script
 * Runs during Docker build to configure environment variables
 */

console.log('[envs.js] Setting up environment configuration...');

const requiredEnvs = [
  'REACT_APP_PROXY_URL',
  'REACT_APP_PROXY_API',
  'REACT_APP_STATE_LEVEL_TENANT_ID'
];

const warnings = [];

requiredEnvs.forEach(env => {
  if (!process.env[env]) {
    warnings.push(`⚠️  ${env} not set - using defaults`);
  }
});

if (warnings.length > 0) {
  console.warn(warnings.join('\n'));
}

// Log configuration
console.log('[envs.js] Configuration:');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'production');
console.log('  REACT_APP_STATE_LEVEL_TENANT_ID:', process.env.REACT_APP_STATE_LEVEL_TENANT_ID || 'pb');
console.log('  Build context: Docker');

console.log('[envs.js] ✅ Environment setup complete\n');
