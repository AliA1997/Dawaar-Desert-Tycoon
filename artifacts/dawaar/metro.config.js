// Metro config tuned for this pnpm monorepo so EAS Build (which installs deps
// from the workspace root) and local dev both resolve modules correctly.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the whole workspace so changes in shared packages are picked up.
config.watchFolders = [workspaceRoot];

// Resolve from the app's own node_modules first, then the hoisted root store.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// pnpm uses a non-hierarchical (symlinked) store; disable the default
// hierarchical lookup so Metro only uses the explicit paths above.
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
