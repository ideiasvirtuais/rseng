#!/usr/bin/env node
/**
 * Faz upload de dist/client/ para a raiz do domínio via FTP/FTPS.
 *
 * Variáveis de ambiente:
 *   FTP_HOST         (obrigatório)  ex.: ftp.rsengenharia.eng.br
 *   FTP_USER         (obrigatório)
 *   FTP_PASSWORD     (obrigatório)
 *   FTP_PORT         (opcional, default 21)
 *   FTP_SECURE       (opcional: "true" | "false" | "implicit", default "false")
 *   FTP_REMOTE_DIR   (opcional, default "/www"). Ex.: "/www", "/public_html", "/"
 *   FTP_LOCAL_DIR    (opcional, default "dist/client")
 *
 * Uso:
 *   FTP_HOST=... FTP_USER=... FTP_PASSWORD=... bun run deploy:ftp
 *
 * Dica: crie um arquivo .env.ftp (git-ignored) e rode:
 *   set -a; source .env.ftp; set +a; bun run deploy:ftp
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { Client } from "basic-ftp";

const {
  FTP_HOST,
  FTP_USER,
  FTP_PASSWORD,
  FTP_PORT = "21",
  FTP_SECURE = "false",
  FTP_REMOTE_DIR = "/www",
  FTP_LOCAL_DIR = "dist/client",
} = process.env;

const missing = ["FTP_HOST", "FTP_USER", "FTP_PASSWORD"].filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`\n✗ Variáveis de ambiente ausentes: ${missing.join(", ")}\n`);
  console.error("  Configure antes de rodar. Exemplo:");
  console.error("    export FTP_HOST=ftp.rsengenharia.eng.br");
  console.error("    export FTP_USER=seu_usuario");
  console.error("    export FTP_PASSWORD='sua_senha'");
  console.error("    bun run deploy:ftp\n");
  process.exit(1);
}

const LOCAL = resolve(process.cwd(), FTP_LOCAL_DIR);
if (!existsSync(LOCAL)) {
  console.error(`\n✗ Diretório local não existe: ${LOCAL}`);
  console.error("  Rode `bun run build` primeiro.\n");
  process.exit(1);
}

const secure =
  FTP_SECURE === "true" ? true : FTP_SECURE === "implicit" ? "implicit" : false;

const client = new Client(30_000);
client.ftp.verbose = false;

async function main() {
  console.log(`→ Conectando em ${FTP_HOST}:${FTP_PORT} (secure=${FTP_SECURE}) como ${FTP_USER}`);
  await client.access({
    host: FTP_HOST,
    port: Number(FTP_PORT),
    user: FTP_USER,
    password: FTP_PASSWORD,
    secure,
  });

  console.log(`→ Entrando em ${FTP_REMOTE_DIR}`);
  await client.ensureDir(FTP_REMOTE_DIR);

  client.trackProgress((info) => {
    if (info.name) process.stdout.write(`  ↑ ${info.name} (${info.bytes} bytes)\r`);
  });

  console.log(`→ Enviando ${LOCAL} → ${FTP_REMOTE_DIR}`);
  await client.uploadFromDir(LOCAL);
  client.trackProgress();
  console.log("\n✓ Upload concluído com sucesso.");
}

main()
  .catch((err) => {
    console.error("\n✗ Falha no deploy FTP:", err?.message || err);
    process.exit(1);
  })
  .finally(() => client.close());
