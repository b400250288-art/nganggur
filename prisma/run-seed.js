const { loadEnvConfig } = require('@next/env');
const { spawnSync } = require('child_process');
const path = require('path');

// Load environment variables using Next.js rules
loadEnvConfig(process.cwd(), true); // Pass true to force load/override if needed

console.log("Environment variables loaded successfully.");
const dbUrl = process.env.DATABASE_URL || "";
const maskedUrl = dbUrl.replace(/:[^:@]+@/, ":****@");
console.log(`Using DATABASE_URL: ${maskedUrl}`);

console.log("Executing seed-real-universities.ts...");

const result = spawnSync('npx', ['ts-node', '--compiler-options', '{"module":"CommonJS"}', 'prisma/seed-real-universities.ts'], {
  stdio: 'inherit',
  env: process.env
});

process.exit(result.status);
