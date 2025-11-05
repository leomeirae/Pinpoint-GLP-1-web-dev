// metro.config.js
// Configuração do Metro bundler para reconhecer extensões PNG maiúsculas

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Adicionar extensões de asset em maiúsculas
config.resolver.assetExts.push(
  'PNG',
  'JPG',
  'JPEG',
  'GIF',
  'WEBP'
);

module.exports = config;

