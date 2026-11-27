#!/usr/bin/env node
/**
 * Comprueba los enlaces oficiales, de referencia y de fuentes. Espaciado por sitio para no cargarlos.
 * Escribe enlaces-rotos.md (vacío si todo va bien). Rotos = 404, 410 o dominio inexistente; 403, 429 y
 * tiempos agotados se anotan aparte como «no concluyentes» (muchos webs bloquean a los programas).
 *   node scripts/comprobar-enlaces.mjs [lugares/a.yaml lugares/b.yaml …]   (sin argumentos: todos)
 */
import fs from "node:fs";
import path from "node:path";
import { RAIZ, lugares, UA, dormir } from "./comun.mjs";

const solo = process.argv.slice(2);
const urls = new Map();
for (const l of lugares()) {
  if (solo.length && !solo.includes(l._archivo)) continue;
  for (const e of [...(l.enlaces_oficiales ?? []), ...(l.enlaces_referencia ?? []), ...(l.fuentes ?? [])]) {
    if (!urls.has(e.url)) urls.set(e.url, []);
    urls.get(e.url).push(l.id);
  }
}
const porHost = new Map();
for (const u of urls.keys()) { const h = new URL(u).host; if (!porHost.has(h)) porHost.set(h, []); porHost.get(h).push(u); }

const rotos = [], dudosos = [];
async function probar(u) {
  for (const metodo of ["HEAD", "GET"]) {
    try {
      const r = await fetch(u, { method: metodo, redirect: "follow", headers: { "user-agent": UA }, signal: AbortSignal.timeout(20000) });
      if (r.ok) return null;
      if (metodo === "HEAD" && r.status !== 404 && r.status !== 410) continue;
      return r.status;
    } catch (e) {
      if (metodo === "GET") return /ENOTFOUND|EAI_AGAIN/.test(String(e.cause ?? e)) ? "dominio inexistente" : "sin respuesta";
    }
  }
  return null;
}
await Promise.all([...porHost.values()].map(async (lista) => {
  for (const u of lista) {
    const s = await probar(u);
    if (s === null) { await dormir(700); continue; }
    (s === 404 || s === 410 || s === "dominio inexistente" ? rotos : dudosos).push({ url: u, estado: s, lugares: [...new Set(urls.get(u))] });
    await dormir(700);
  }
}));
const linea = (x) => `- ${x.url} (${x.estado}) — ${x.lugares.slice(0, 5).join(", ")}${x.lugares.length > 5 ? ` y ${x.lugares.length - 5} más` : ""}`;
let md = "";
if (rotos.length) md += `## Enlaces rotos (${rotos.length})\n\n${rotos.map(linea).join("\n")}\n\n`;
if (dudosos.length) md += `## No concluyentes (${dudosos.length})\n\nPueden ser bloqueos a programas automáticos; conviene abrirlos a mano.\n\n${dudosos.map(linea).join("\n")}\n`;
fs.writeFileSync(path.join(RAIZ, "enlaces-rotos.md"), md);
console.log(`${urls.size} enlaces: ${rotos.length} rotos, ${dudosos.length} no concluyentes`);
