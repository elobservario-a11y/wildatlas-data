// Utilidades compartidas por los scripts del repositorio de datos.
import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";

export const RAIZ = path.resolve(import.meta.dirname, "..");
export const leerYaml = (rel) => yaml.load(fs.readFileSync(path.join(RAIZ, rel), "utf8"));
export const ids = (dir) => fs.readdirSync(path.join(RAIZ, dir)).filter((f) => f.endsWith(".yaml")).map((f) => f.replace(/\.yaml$/, "")).sort();
export const lugares = () => ids("lugares").map((id) => ({ id, ...leerYaml(`lugares/${id}.yaml`), _archivo: `lugares/${id}.yaml` }));
export const especies = () => ids("especies").map((id) => ({ id, ...leerYaml(`especies/${id}.yaml`) }));
export const UA = "wildatlas-data-check/1.0 (+https://github.com/elobservario-a11y/wildatlas-data)";
export const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
