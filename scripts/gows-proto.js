// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { execSync } = require('child_process');

// Defaults
const CONFIG_FILE = 'waha.config.json';
// Load defaults from package.json
gows = (() => {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    return config.waha.gows || {};
  } catch (error) {
    return {};
  }
})();

const DEFAULT_REPO = gows.repo;
if (!DEFAULT_REPO) {
  throw new Error(`Missing default repo in ${CONFIG_FILE}`);
}
const DEFAULT_REF = gows.ref;
if (!DEFAULT_REF) {
  throw new Error('Missing default ref in ${CONFIG_FILE}');
}
const DEFAULT_DIR = './src/core/engines/gows/proto';

const PROTO_FILES = ['gows.proto'];
const PROTO_OUTPUT = './src/core/engines/gows/grpc';
const PROTO_SOURCE_DIR = 'proto';

// Helper function to clean directory
function cleanDirectory(directory, suffix) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    return;
  }
  if (!suffix) {
    return;
  }

  const files = fs.readdirSync(directory);
  for (const file of files) {
    const filePath = path.join(directory, file);
    if (file.endsWith(suffix)) {
      fs.unlinkSync(filePath);
    }
  }
}

// Helper function to download files
async function downloadFiles(repo, ref, directory) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const axios = require('axios');
  for (const file of PROTO_FILES) {
    const url = `https://raw.githubusercontent.com/${repo}/${ref}/${PROTO_SOURCE_DIR}/${file}`;
    const filePath = path.join(directory, file);
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, response.data);
      console.log(`Downloaded: ${file}`);
    } catch (error) {
      console.error(`Failed to download ${file}: ${error.message}`);
    }
  }
}

// Handler for fetch command
async function handleFetch(repo, ref, dir) {
  console.log(`Fetching .proto files from ${repo}@${ref} to ${dir}...`);
  cleanDirectory(dir, '.proto');
  await downloadFiles(repo, ref, dir);
}

// Handler for build command
function handleBuild(dir) {
  console.log('Building gRPC files...');
  cleanDirectory(PROTO_OUTPUT);

  const command = `node_modules/.bin/grpc_tools_node_protoc \
        --plugin=protoc-gen-ts=node_modules/.bin/protoc-gen-ts \
        --plugin=protoc-gen-grpc=node_modules/.bin/grpc_tools_node_protoc_plugin \
        --js_out=import_style=commonjs,binary:${PROTO_OUTPUT} \
        --grpc_out=grpc_js:${PROTO_OUTPUT} \
        --ts_out=grpc_js:${PROTO_OUTPUT} \
        -I ${dir} ${dir}/gows.proto`;

  try {
    execSync(command, { stdio: 'inherit' });
    console.log('gRPC files built successfully.');
  } catch (error) {
    console.error(`Failed to build gRPC files: ${error.message}`);
    process.exitCode = 1;
  }
}

//
// Commands
//

function argValue(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const command = process.argv[2];
if (command === 'fetch') {
  handleFetch(
    argValue('repo', DEFAULT_REPO),
    argValue('ref', DEFAULT_REF),
    argValue('dir', DEFAULT_DIR),
  );
} else if (command === 'build') {
  handleBuild(argValue('dir', DEFAULT_DIR));
} else {
  console.error('Usage: node scripts/gows-proto.js <fetch|build> [--repo owner/repo] [--ref ref] [--dir dir]');
  process.exitCode = 1;
}
