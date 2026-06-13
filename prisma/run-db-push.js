const { loadEnvConfig } = require('@next/env');
const { spawnSync } = require('child_process');

loadEnvConfig(process.cwd(), true);

console.log("Environment variables loaded. Running prisma db push...");

const result = spawnSync('npx', ['prisma', 'db', 'push'], {
  stdio: 'inherit',
  env: process.env
});

process.exit(result.status);
