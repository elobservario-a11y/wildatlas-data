#!/usr/bin/env node
/**
 * Valida todo el contenido: esquema, identificadores, referencias cruzadas, capas, licencias de
 * fotos y ubicaciones. Los errores hacen fallar la comprobación; los avisos piden revisión humana.
 *
 *   node scripts/validar.mjs            # esquema, referencias y avisos de texto
 *   node scripts/validar.mjs --paises   # además, comprueba que las coordenadas caen en el país indicado
 *                                       # (descarga Natural Earth, dominio público; un aviso, no un error)
 */
import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { RAIZ, leerYaml, lugares, especies, ids } from "./comun.mjs";

const errores = [];
const avisos = [];
const err = (f, m) => errores.push(`${f}: ${m}`);
const aviso = (f, m) => avisos.push(`${f}: ${m}`);

const ajv = new Ajv2020({ allErrors: true, strict: false });
const vLugar = ajv.compile(JSON.parse(fs.readFileSync(path.join(RAIZ, "schema/lugar.schema.json"), "utf8")));
const vEspecie = ajv.compile(JSON.parse(fs.readFileSync(path.join(RAIZ, "schema/especie.schema.json"), "utf8")));
const fmt = (v) => (v.errors ?? []).map((e) => `${e.instancePath || "/"} ${e.message}`).join("; ");

const idsEspecies = new Set(ids("especies"));
const idsHabitats = new Set(leerYaml("habitats.yaml").map((x) => x.id));
const idsPaises = new Set(leerYaml("paises.yaml").map((x) => x.id));
const idsProyectos = new Set(leerYaml("proyectos-actuales.yaml").map((x) => x.id));
const todosLugares = lugares();

for (const e of especies()) {
  const { id, ...doc } = e;
  if (!vEspecie({ id, ...doc })) err(`especies/${id}.yaml`, fmt(vEspecie));
}
const vistos = new Set();
for (const { _archivo, ...l } of todosLugares) {
  if (vistos.has(l.id)) err(_archivo, "id repetido");
  vistos.add(l.id);
  if (!vLugar(l)) { err(_archivo, fmt(vLugar)); continue; }
  for (const x of l.especies ?? []) if (!idsEspecies.has(x)) err(_archivo, `especie inexistente: ${x}`);
  if (!(l.habitats ?? []).length) aviso(_archivo, "sin hábitats");
  for (const x of l.habitats ?? []) if (!idsHabitats.has(x)) err(_archivo, `hábitat inexistente: ${x}`);
  for (const x of l.paises) if (!idsPaises.has(x)) err(_archivo, `país inexistente: ${x}`);
  for (const x of l.proyectos ?? []) if (!idsProyectos.has(x)) err(_archivo, `proyecto inexistente: ${x}`);
  if (l.contorno && !fs.existsSync(path.join(RAIZ, l.contorno.capa))) err(_archivo, `falta la capa ${l.contorno.capa}`);
  const u = l.ubicacion;
  if (u.fuente === "osm" && (u.lat !== undefined || u.lon !== undefined)) err(_archivo, "ubicación de origen OSM con coordenadas fuera de capas/osm (debe ir en la capa ODbL)");
  if (u.precision === "oculta" && (u.lat !== undefined || u.lon !== undefined)) err(_archivo, "ubicación oculta con coordenadas");
  if (u.precision !== "oculta" && u.fuente !== "osm" && (u.lat === undefined || u.lon === undefined)) err(_archivo, "faltan lat/lon");
  if (!(l.fuentes ?? []).length) aviso(_archivo, "sin fuentes");
  // Protección ecológica y textos: avisos para la persona que revisa.
  const textos = JSON.stringify([l.resumen, l.unico, l.observaciones, l.texto, l.temporada_nota, l.masificacion_nota]);
  if (/-?\d{1,2}[.,]\d{3,}\s*[,;]\s*-?\d{1,3}[.,]\d{3,}/.test(textos)) aviso(_archivo, "coordenadas dentro del texto");
  if (/(ubicaci[oó]n|localizaci[oó]n|coordenadas|gps)[^"]{0,40}(exact|preci)[^"]{0,60}(nido|madriguera|dormidero)|(nido|madriguera|dormidero)[^"]{0,60}(ubicaci[oó]n|coordenadas|gps)[^"]{0,40}(exact|preci)/i.test(textos)) aviso(_archivo, "posible ubicación precisa de nido, madriguera o dormidero");
  if (/«[^»]{200,}»/.test(textos)) aviso(_archivo, "cita larga entre comillas: parafrasear");
}
const idsLugares = new Set(todosLugares.map((l) => l.id));
for (const d of ["cdda", "natura2000", "osm"]) {
  const dir = path.join(RAIZ, "capas", d);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) if (f.endsWith(".geojson") && f !== "puntos-osm.geojson" && !idsLugares.has(f.replace(/\.geojson$/, ""))) err(`capas/${d}/${f}`, "capa sin ficha");
}

// ---------- Coordenadas dentro del país (opcional) ----------
if (process.argv.includes("--paises")) {
  const cache = path.join(RAIZ, ".cache/paises.geojson");
  if (!fs.existsSync(cache)) {
    fs.mkdirSync(path.dirname(cache), { recursive: true });
    const r = await fetch("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson");
    if (!r.ok) throw new Error(`no se pudo descargar Natural Earth: ${r.status}`);
    fs.writeFileSync(cache, Buffer.from(await r.arrayBuffer()));
  }
  const NE = JSON.parse(fs.readFileSync(cache, "utf8")).features;
  const iso = (p) => (p.ISO_A2_EH && p.ISO_A2_EH !== "-99" ? p.ISO_A2_EH : p.ISO_A2 && p.ISO_A2 !== "-99" ? p.ISO_A2 : null);
  const polis = new Map();
  for (const f of NE) { const c = iso(f.properties); if (c) polis.set(c, f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates); }
  const dentro = (x, y, anillo) => { let d = false; for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) { const [xi, yi] = anillo[i], [xj, yj] = anillo[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) d = !d; } return d; };
  const enPais = (x, y, c) => (polis.get(c) ?? []).some((poly) => dentro(x, y, poly[0]) && !poly.slice(1).some((h) => dentro(x, y, h)));
  const km = (x1, y1, x2, y2) => { const r = Math.PI / 180, a = Math.sin(((y2 - y1) * r) / 2) ** 2 + Math.cos(y1 * r) * Math.cos(y2 * r) * Math.sin(((x2 - x1) * r) / 2) ** 2; return 12742 * Math.asin(Math.sqrt(a)); };
  const distancia = (x, y, c) => Math.min(...(polis.get(c) ?? []).flatMap((poly) => poly[0].map(([px, py]) => km(x, y, px, py))), Infinity);
  for (const l of todosLugares) {
    const u = l.ubicacion;
    if (u.lat === undefined) continue;
    const conocidos = l.paises.filter((c) => polis.has(c));
    if (!conocidos.length) { aviso(l._archivo, `sin polígono de referencia para ${l.paises.join(",")}`); continue; }
    if (conocidos.some((c) => enPais(u.lon, u.lat, c))) continue;
    const d = Math.min(...conocidos.map((c) => distancia(u.lon, u.lat, c)));
    if (d > 25) aviso(l._archivo, `la coordenada queda a ~${Math.round(d)} km de ${conocidos.join("/")}`);
  }
}

for (const a of avisos) console.log(`AVISO  ${a}`);
for (const e of errores) console.log(`ERROR  ${e}`);
console.log(`\n${todosLugares.length} lugares, ${idsEspecies.size} especies: ${errores.length} errores, ${avisos.length} avisos`);
process.exit(errores.length ? 1 : 0);
