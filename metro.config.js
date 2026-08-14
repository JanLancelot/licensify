const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable WebAssembly (.wasm) support for expo-sqlite on web
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

// Add COEP and COOP headers to support SharedArrayBuffer on web
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      return middleware(req, res, next);
    };
  },
};

module.exports = config;

