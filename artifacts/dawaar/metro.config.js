// Default Expo Metro config. The app does not import any `@workspace/*` packages
// at runtime, so no monorepo-specific resolver tweaks are needed — and pnpm's
// nested (symlinked) store relies on Metro's default hierarchical lookup to
// resolve transitive deps like `@expo/metro-runtime`, so we must NOT disable it.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the workspace root so Metro can follow pnpm's symlinks into the shared
// store. Hierarchical lookup is left at its default (enabled) for pnpm.
config.watchFolders = [workspaceRoot];


// Resolve from the app's own node_modules first, then the hoisted root store.
// config.resolver.nodeModulesPaths = [
//   path.resolve(projectRoot, "node_modules"),
//   path.resolve(workspaceRoot, "node_modules"),
// ];

// // pnpm uses a non-hierarchical (symlinked) store; disable the default
// // hierarchical lookup so Metro only uses the explicit paths above.
// config.resolver.disableHierarchicalLookup = true;

module.exports = config;
