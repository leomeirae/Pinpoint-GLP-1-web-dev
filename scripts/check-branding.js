#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Checking for user-facing "Shotsy" branding...\n');

// Note: "Shotsy" is used as internal component prefix (ShotsyCard, useShotsyColors, etc.)
// This is acceptable for technical/internal naming.
// We only check for user-facing strings that should use "Pinpoint GLP-1"

// Patterns to search for - focusing on user-facing text
const userFacingPatterns = [
  '"Shotsy"',  // String literals in user-facing text
  "'Shotsy'",  // String literals in user-facing text
  'title.*Shotsy', // Titles
  'description.*Shotsy', // Descriptions
  'label.*Shotsy', // Labels
];

// Directories to exclude from search
const excludeDirs = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.expo',
  'android/app/build',
  'ios/build',
  '.github',
  'scripts', // Allow this script itself to reference "Shotsy"
  '.cursor', // Cursor IDE rules
];

// Files to exclude
const excludeFiles = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '.DS_Store',
  '*.md', // Documentation/changelog files
];

// Build grep exclude pattern
const excludePattern = [
  ...excludeDirs.map(d => `--exclude-dir=${d}`),
  ...excludeFiles.map(f => `--exclude=${f}`)
].join(' ');

// Technical patterns that are ALLOWED (internal component names, hooks, types)
const allowedTechnicalPatterns = [
  /Shotsy[A-Z]\w+/, // ShotsyCard, ShotsyButton, ShotsyColors, etc.
  /useShotsy/, // Hooks like useShotsyColors
  /shotsy-/, // File names like shotsy-card.tsx
  /@shotsy/, // Package scope
  /SHOTSY_[A-Z_]+/, // Constants like SHOTSY_THEMES
  /\.shotsy/i, // File extensions or properties
  /import.*Shotsy/i, // Import statements
  /export.*Shotsy/i, // Export statements
  /interface.*Shotsy/i, // TypeScript interfaces
  /type.*Shotsy/i, // TypeScript types
  /const.*Shotsy/i, // Const declarations
  /ShotsyThemes\.ts/i, // Specific file names
];

function isAllowedTechnicalReference(line) {
  // Check if line contains any allowed technical pattern
  return allowedTechnicalPatterns.some(pattern => pattern.test(line));
}

let foundIssues = false;
let foundUserFacingIssues = [];

console.log('Note: Internal component names like "ShotsyCard" are allowed.');
console.log('Only checking for user-facing "Shotsy" references.\n');

// Simple check: search for "Shotsy" in user-visible strings
try {
  const grepCommand = `grep -rn ${excludePattern} --color=never "Shotsy" . 2>/dev/null || true`;

  const result = execSync(grepCommand, {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });

  if (result.trim()) {
    const lines = result.trim().split('\n');

    // Filter for actual user-facing issues
    const userFacingLines = lines.filter(line => {
      // Skip this script
      if (line.includes('check-branding.js')) return false;

      // Skip if it's an allowed technical reference
      if (isAllowedTechnicalReference(line)) return false;

      // Check if it looks like user-facing text (in quotes, labels, etc.)
      const hasUserFacingPattern =
        /"Shotsy"/i.test(line) ||
        /'Shotsy'/i.test(line) ||
        /title[^:]*:.*Shotsy/i.test(line) ||
        /description[^:]*:.*Shotsy/i.test(line) ||
        /label[^:]*:.*Shotsy/i.test(line) ||
        /Text.*>.*Shotsy.*</i.test(line) ||
        /placeholder.*Shotsy/i.test(line);

      return hasUserFacingPattern;
    });

    if (userFacingLines.length > 0) {
      foundUserFacingIssues = userFacingLines;
      foundIssues = true;
    }
  }
} catch (error) {
  if (error.status !== 1) {
    console.error('Error during search:', error.message);
  }
}

if (foundIssues) {
  console.log(`❌ Branding check FAILED: Found ${foundUserFacingIssues.length} user-facing "Shotsy" reference(s)\n`);

  foundUserFacingIssues.slice(0, 10).forEach(line => {
    console.log(`   ${line}`);
  });

  if (foundUserFacingIssues.length > 10) {
    console.log(`   ... and ${foundUserFacingIssues.length - 10} more\n`);
  }

  console.log('\n📝 Action required:');
  console.log('   Replace user-facing "Shotsy" text with "Pinpoint GLP-1"');
  console.log('   (Internal component names like ShotsyCard are fine)\n');
  process.exit(1);
} else {
  console.log('✅ Branding check PASSED!');
  console.log('   No user-facing "Shotsy" references found.');
  console.log('   (Internal component names are allowed and were ignored)\n');
  process.exit(0);
}
