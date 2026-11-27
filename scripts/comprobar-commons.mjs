#!/usr/bin/env node
/** Comprueba en Wikimedia Commons que cada foto referenciada existe y que su licencia coincide con la anotada. Escribe commons-incidencias.md. */
import fs from "node:fs";
import path from "node:path";
import { RAIZ, lugares, UA } from "./comun.mjs";

const fotos = [];
for (const l of lugares()) for (const f of l.fotos ?? []) fotos.push({ lugar: l.id, ...f, titulo: decodeURIComponent(f.pagina_commons.split("/wiki/")[1]).replace(/_/g, " ") });
const norm = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const incidencias = [];
for (let i = 0; i < fotos.length; i += 40) {
  const lote = fotos.slice(i, i + 40);
  const url = "https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({ action: "query", format: "json", prop: "imageinfo", iiprop: "extmetadata", titles: lote.map((f) => f.titulo).join("|"), redirects: "1" });
  const r = await fetch(url, { headers: { "user-agent": UA } });
  if (!r.ok) { incidencias.push(`- Commons respondió ${r.status} para el lote que empieza en ${lote[0].lugar}: repetir.`); continue; }
  const j = await r.json();
  const alias = new Map((j.query?.normalized ?? []).concat(j.query?.redirects ?? []).map((x) => [x.from, x.to]));
  const paginas = new Map(Object.values(j.query?.pages ?? {}).map((p) => [p.title, p]));
  for (const f of lote) {
    let t = f.titulo; for (let k = 0; k < 3 && alias.has(t); k++) t = alias.get(t);
    const p = paginas.get(t);
    if (!p || p.missing !== undefined) { incidencias.push(`- ${f.lugar}: la foto «${f.titulo}» ya no existe en Commons`); continue; }
    const lic = p.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value;
    if (lic && norm(lic) !== norm(f.licencia) && !(norm(lic).replace(/ de$| at$| es$| lu$| pl$/, "") === norm(f.licencia).replace(/ de$| at$| es$| lu$| pl$/, ""))) incidencias.push(`- ${f.lugar}: «${f.titulo}» figura como «${f.licencia}» y Commons indica «${lic}»`);
  }
}
fs.writeFileSync(path.join(RAIZ, "commons-incidencias.md"), incidencias.length ? `## Fotos con incidencias (${incidencias.length})\n\n${incidencias.join("\n")}\n` : "");
console.log(`${fotos.length} fotos: ${incidencias.length} incidencias`);
