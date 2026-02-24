/**
 * Command-line validation for RoadmapSnap config.
 * Reads js/config.js, extracts CONFIG in a sandbox (vm), validates against schema/config.schema.json with ajv.
 * Exit 0 on success, 1 on failure.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
import Ajv from 'ajv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const configPath = join(projectRoot, 'js', 'config.js');
const schemaPath = join(projectRoot, 'schema', 'config.schema.json');

function extractConfig() {
  const raw = readFileSync(configPath, 'utf8');
  // Sandbox: run config so CONFIG is assigned to a context variable we can read.
  // Replace first "const CONFIG = " with "CONFIG = " so the assignment runs in the sandbox context.
  const code = raw.replace(/\bconst\s+CONFIG\s*=\s*/, 'CONFIG = ');
  const context = { CONFIG: null };
  vm.createContext(context);
  vm.runInContext(code, context, { filename: configPath, timeout: 5000 });
  if (context.CONFIG == null) {
    throw new Error('CONFIG was not assigned (is the file "const CONFIG = { ... };"?)');
  }
  return context.CONFIG;
}

function main() {
  let config;
  try {
    config = extractConfig();
  } catch (e) {
    console.error('❌ Failed to load config:', e.message);
    process.exit(1);
  }

  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
  const ajv = new Ajv({ allErrors: true, validateFormats: false });
  const valid = ajv.validate(schema, config);

  if (valid) {
    console.log('✅ Config is valid');
    process.exit(0);
  }

  console.error('❌ Config validation errors:');
  for (const err of ajv.errors) {
    const path = err.instancePath || '(root)';
    console.error(`   - ${path}: ${err.message}`);
  }
  process.exit(1);
}

main();
