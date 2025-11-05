#!/usr/bin/env node
/**
 * Lightweight TestSprite MCP client to automate the end-to-end testing flow.
 *
 * Usage:
 *   TESTSPRITE_API_KEY=... node scripts/run-testsprite.js
 *
 * Make sure your Expo app is running locally (e.g. on http://localhost:8081/welcome)
 * before executing this helper, otherwise TestSprite will abort when it cannot
 * reach the target port.
 */

const { spawn } = require('child_process');
const { fetch, FormData } = require('undici');
const fs = require('fs');
const path = require('path');

const PROJECT_PATH = path.resolve(__dirname, '..');
const PROJECT_NAME = path.basename(PROJECT_PATH);
const CONFIG_DIR = path.join(PROJECT_PATH, 'testsprite', 'tmp');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');
const CODE_SUMMARY_PATH = path.join(CONFIG_DIR, 'code_summary.json');

const API_KEY = process.env.TESTSPRITE_API_KEY;
if (!API_KEY) {
  console.error('TESTSPRITE_API_KEY environment variable is required.');
  process.exit(1);
}

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function waitForServerPort(timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(CONFIG_PATH)) {
      try {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        if (config.serverPort) {
          return config;
        }
      } catch (error) {
        // Ignore parse errors while the file is being written.
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('Timed out waiting for TestSprite config to expose serverPort.');
}

async function commitBootstrapConfig(config, { port, pathname, scope }) {
  const baseUrl = `http://localhost:${config.serverPort}`;
  const url = new URL('/api/commit', baseUrl);
  url.searchParams.set('project_path', PROJECT_PATH);

  const form = new FormData();
  if (port) {
    form.set('port', String(port));
  }
  if (pathname) {
    form.set('pathname', pathname);
  }
  if (scope) {
    form.set('scope', scope);
  }
  form.set('mode', 'Frontend');

  const response = await fetch(url, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to commit TestSprite config: ${response.status} ${response.statusText} - ${text}`);
  }
}

function createCodeSummaryFile() {
  ensureDirSync(CONFIG_DIR);
  const summary = {
    tech_stack: [
      'TypeScript',
      'React Native (Expo)',
      'Expo Router',
      'Supabase',
      'Clerk',
    ],
    features: [
      {
        name: 'Welcome & Auth Flow',
        description: 'Expo Router screens for onboarding, welcome, and authentication integrated with Clerk.',
        files: [
          'app/index.tsx',
          'app/(auth)/sign-in.tsx',
          'hooks/useOnboarding.ts',
        ],
      },
      {
        name: 'Medication Tracking',
        description: 'Hooks and components assisting users in logging medications, weights, and side effects.',
        files: [
          'hooks/useMedications.ts',
          'hooks/useSideEffects.ts',
          'hooks/useWeightLogs.ts',
        ],
      },
      {
        name: 'Community & Insights',
        description: 'Community stats, insights, and achievements surfaced throughout the app.',
        files: [
          'hooks/useCommunityStats.ts',
          'hooks/useInsights.ts',
          'hooks/useAchievements.ts',
        ],
      },
      {
        name: 'PDF & Notifications',
        description: 'Utility layers wrapping document generation and push notifications.',
        files: [
          'lib/pdf-generator.ts',
          'lib/notifications.ts',
        ],
      },
      {
        name: 'Supabase Persistence',
        description: 'Data access and synchronization with Supabase services.',
        files: [
          'lib/supabase.ts',
          'hooks/useUserSync.ts',
        ],
      },
    ],
  };

  fs.writeFileSync(CODE_SUMMARY_PATH, JSON.stringify(summary, null, 2));
  return CODE_SUMMARY_PATH;
}

function parseToolResponse(result) {
  if (!result) {
    return null;
  }
  if (result.structuredContent) {
    return result.structuredContent;
  }
  if (Array.isArray(result.content) && result.content.length > 0) {
    const textBlock = result.content.find((block) => block.type === 'text');
    if (textBlock) {
      try {
        return JSON.parse(textBlock.text);
      } catch (error) {
        return textBlock.text;
      }
    }
  }
  return result;
}

async function run() {
  ensureDirSync(CONFIG_DIR);

  const child = spawn(
    'npx',
    ['@testsprite/testsprite-mcp@latest', 'server'],
    {
      cwd: PROJECT_PATH,
      env: {
        ...process.env,
        API_KEY,
      },
      stdio: ['pipe', 'pipe', 'inherit'],
    },
  );

  let stdoutBuffer = '';
  let idCounter = 1;
  const pending = new Map();

  function send(message) {
    child.stdin.write(JSON.stringify(message) + '\n');
  }

  function request(method, params = {}) {
    const id = idCounter++;
    send({ jsonrpc: '2.0', id, method, params });
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
    });
  }

  function notify(method, params = {}) {
    send({ jsonrpc: '2.0', method, params });
  }

  async function callTool(name, args = {}) {
    const response = await request('tools/call', {
      name,
      arguments: args,
    });
    if (response.error) {
      throw new Error(response.error.message || `Tool ${name} failed.`);
    }
    return parseToolResponse(response.result || response);
  }

  child.stdout.on('data', (chunk) => {
    stdoutBuffer += chunk.toString();
    let index;
    while ((index = stdoutBuffer.indexOf('\n')) !== -1) {
      const line = stdoutBuffer.slice(0, index).trim();
      stdoutBuffer = stdoutBuffer.slice(index + 1);
      if (!line) {
        continue;
      }
      let message;
      try {
        message = JSON.parse(line);
      } catch (error) {
        console.warn('Failed to parse MCP message:', line);
        continue;
      }

      if (message.id && pending.has(message.id)) {
        const { resolve, reject } = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) {
          reject(new Error(message.error.message || 'Unknown MCP error'));
        } else {
          resolve(message);
        }
        continue;
      }

      if (message.method === 'notifications/progress') {
        const { progress = 0, total, message: progressMessage } = message.params || {};
        const formatted = total ? `${progress}/${total}` : `${progress}`;
        console.log(`Progress(${formatted}): ${progressMessage || ''}`);
      } else if (message.method === 'notifications/message') {
        const text = (message.params && message.params.message) || '';
        console.log(`Server message: ${text}`);
      } else {
        console.log('Unhandled message:', message);
      }
    }
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`TestSprite MCP server exited with code ${code}`);
    }
  });

  // ---- Initialize MCP connection ----
  await request('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {
      tools: {},
    },
    clientInfo: {
      name: 'codex-testsprite-runner',
      version: '0.1.0',
    },
  });
  notify('notifications/initialized', {});

  const toolList = await request('tools/list');
  console.log('Available TestSprite tools:', toolList.result?.tools?.map((tool) => tool.name).join(', '));

  // ---- Bootstrap tests (starts local server & waits for config commit) ----
  console.log('Bootstrapping TestSprite configuration...');
  const bootstrapPromise = callTool('testsprite_bootstrap_tests', {
    projectPath: PROJECT_PATH,
    type: 'frontend',
    testScope: 'codebase',
    localPort: 8081,
    pathname: 'welcome',
  });

  const config = await waitForServerPort();
  await commitBootstrapConfig(config, {
    port: 8081,
    pathname: 'welcome',
    scope: 'codebase',
  });
  console.log('Committed TestSprite UI configuration.');

  const bootstrapResult = await bootstrapPromise;
  console.log('Bootstrap next actions:', bootstrapResult);

  // ---- Generate code summary (LLM assisted step we handle ourselves) ----
  console.log('Requesting code summary instructions...');
  const codeSummaryResult = await callTool('testsprite_generate_code_summary', {
    projectRootPath: PROJECT_PATH,
  });
  console.log('Code summary guidance received.');

  const codeSummaryFile = createCodeSummaryFile();
  console.log(`Wrote code summary to ${codeSummaryFile}`);

  // ---- Generate standardized PRD ----
  console.log('Calling TestSprite to generate standardized PRD...');
  const prdResult = await callTool('testsprite_generate_standardized_prd', {
    projectPath: PROJECT_PATH,
  });
  console.log('Standardized PRD generated. Next actions:', prdResult);

  // ---- Generate frontend test plan ----
  console.log('Generating frontend test plan...');
  const testPlanResult = await callTool('testsprite_generate_frontend_test_plan', {
    projectPath: PROJECT_PATH,
  });
  console.log('Frontend test plan generated. Next actions:', testPlanResult);

  // ---- Execute tests ----
  console.log('Starting automated test execution...');
  const executionResult = await callTool('testsprite_generate_code_and_execute', {
    projectName: PROJECT_NAME,
    projectPath: PROJECT_PATH,
    testIds: [],
    additionalInstruction: '',
  });
  console.log('Test execution result:', executionResult);

  child.kill();
}

run().catch((error) => {
  console.error('TestSprite automation failed:', error);
  process.exit(1);
});
