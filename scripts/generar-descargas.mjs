#!/usr/bin/env node
/** Genera descargas/lugares.csv y descargas/lugares.geojson a partir de los YAML. Sin coordenadas de origen OSM ni ocultas. */
import fs from "node:fs";
import path from "node:path";
import { RAIZ, lugares } from "./comun.mjs";

const filas = [];
const puntos = [];
for (const l of lugares()) {
  const u = l.ubicacion;
  const hay = u.lat !== undefined && u.lon !== undefined;
  filas.push({
    id: l.id, nombre_es: l.nombre.es, nombre_original: l.nombre_original ?? "", paises: l.paises.join(";"), region_es: l.region?.es ?? "",
    lat: hay ? u.lat : "", lon: hay ? u.lon : "", fuente_ubicacion: u.precision === "oculta" ? "oculta" : u.fuente ?? "", calidad_ubicacion: u.calidad ?? "",
    habitats: (l.habitats ?? []).join(";"), especies: (l.especies ?? []).join(";"), designaciones: (l.designaciones ?? []).join(";"),
    masificacion: l.masificacion ?? "", valoracion: l.valoracion ?? "", estado_editorial: l.estado_editorial,
    fotos: (l.fotos ?? []).length, fuentes: (l.fuentes ?? []).length, idiomas: ["es", ...["en", "fr", "de", "it", "pt"].filter((x) => l.texto?.[x])].join(";"),
  });
  if (hay) puntos.push({ type: "Feature", properties: { id: l.id, nombre: l.nombre.es, paises: l.paises.join(";"), tipo: u.tipo, radio_km: u.radio_km ?? null, calidad: u.calidad }, geometry: { type: "Point", coordinates: [u.lon, u.lat] } });
}
const cols = Object.keys(filas[0]);
const esc = (v) => { const s = String(v); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
fs.mkdirSync(path.join(RAIZ, "descargas"), { recursive: true });
fs.writeFileSync(path.join(RAIZ, "descargas/lugares.csv"), [cols.join(","), ...filas.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n") + "\n");
fs.writeFileSync(path.join(RAIZ, "descargas/lugares.geojson"), JSON.stringify({ type: "FeatureCollection", features: puntos }) + "\n");
console.log(`descargas: ${filas.length} filas CSV, ${puntos.length} puntos GeoJSON`);
