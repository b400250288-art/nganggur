const { loadEnvConfig } = require('@next/env');
const { spawnSync } = require('child_process');

loadEnvConfig(process.cwd(), true);

console.log("Environment variables loaded. Running main prisma seed...");

const result = spawnSync('npx', ['ts-node', '--compiler-options', '{"module":"CommonJS"}', 'prisma/seed.ts'], {
  stdio: 'inherit',
  env: process.env
});

process.exit(result.status);
