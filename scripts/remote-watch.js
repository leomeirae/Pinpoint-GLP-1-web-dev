const { execSync, spawnSync } = require("child_process");

function sh(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
  } catch (e) {
    return "";
  }
}

function now() {
  return new Date().toLocaleString();
}

function detectUpstream() {
  // branch atual
  const branch = sh("git rev-parse --abbrev-ref HEAD") || "main";
  // upstream configurado
  let upstream = sh("git rev-parse --abbrev-ref --symbolic-full-name @{u}");
  if (!upstream) {
    // fallback: origin/main (ou origin/<branch>)
    const tryBranch = sh(`git ls-remote --heads origin ${branch}`) ? branch : "main";
    upstream = `origin/${tryBranch}`;
  }
  return { branch, upstream };
}

function fetch() {
  try {
    execSync("git fetch --prune origin", { stdio: "ignore" });
    return true;
  } catch (e) {
    console.error(`[${now()}] Erro ao executar git fetch:`, e.message);
    return false;
  }
}

function showIncoming(upstream) {
  const commits = sh(`git log --oneline HEAD..${upstream}`);
  const files = sh(`git diff --name-status HEAD..${upstream}`);
  if (commits) {
    console.log(`\n[${now()}] 📥 Novidades em ${upstream}:`);
    console.log("— Commits que ainda não estão no seu HEAD:");
    console.log(commits);
    if (files) {
      console.log("\n— Arquivos alterados (STATUS\tPATH):");
      console.log(files);
    }
    console.log("\nSugestão para atualizar de forma limpa:");
    console.log(`git pull --rebase  # ou rebase manual em relação a ${upstream}\n`);
  } else {
    console.log(`[${now()}] ✅ Sem novidades em ${upstream}.`);
  }
}

function loop(intervalMs = 120000) {
  const { branch, upstream } = detectUpstream();
  console.log(`Iniciando watcher... branch local: ${branch} | upstream: ${upstream}`);
  console.log(`Verificando a cada ${intervalMs / 1000}s. Pressione Ctrl+C para sair.`);

  // rodada imediata
  if (fetch()) showIncoming(upstream);

  setInterval(() => {
    if (fetch()) showIncoming(upstream);
  }, intervalMs);
}

loop(120000);

