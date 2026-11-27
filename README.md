# Datos abiertos del Atlas de la Europa Salvaje

Los datos y textos de [wildatlas.eu](https://wildatlas.eu): **568 lugares** de naturaleza bien conservada en 41 países y territorios, **225 especies**, 15 hábitats, sus fuentes, las referencias a sus fotos y las capas de contornos, en seis idiomas (es, en, fr, de, it, pt). El atlas es un proyecto independiente y de afición: sin cuentas, sin cookies, sin analítica.

*English: the open data and texts behind wildatlas.eu — 568 well-conserved natural places in 41 countries, 225 species, sources, photo references (never copies) and boundary layers, in six languages. Contributions welcome; see CONTRIBUTING.md.*

## Qué hay aquí

| Carpeta o archivo | Contenido | Licencia |
|---|---|---|
| `lugares/` | Una ficha YAML por lugar: nombre, país, ubicación, hábitats, especies, temporada, enlaces oficiales, fuentes, referencias a fotos y textos en seis idiomas | Textos: **CC BY-SA 4.0**. Datos: **CC BY 4.0** |
| `especies/` | Una ficha YAML por especie | Igual |
| `habitats.yaml`, `paises.yaml`, `proyectos-actuales.yaml` | Tablas de apoyo | CC BY 4.0 |
| `descargas/` | `lugares.csv` y `lugares.geojson` (generados desde los YAML) | CC BY 4.0 |
| `capas/cdda/`, `capas/natura2000/` | Contornos de la EEA, simplificados | CC BY (EEA), ver `capas/README.md` |
| `capas/osm/` | Contornos y puntos de origen OpenStreetMap | **ODbL 1.0**, © OpenStreetMap contributors |
| `schema/` | Esquemas JSON de lugares y especies | CC BY 4.0 |

Más detalle en [LICENSE.md](LICENSE.md). Para citar: «Atlas de la Europa Salvaje (wildatlas.eu), El Observario y colaboradores».

## Cosas que conviene saber

- **El estado editorial no es el estado de conservación.** `estado_editorial` dice cuánto se ha revisado la ficha (`pendiente-de-revision`, `en-revision`, `valoracion-revisada`, `desactualizada`), no cómo está el espacio.
- **Las ubicaciones son orientativas.** Casi todas son un punto o un círculo estimado, no una entrada ni un aparcamiento. Un contorno oficial, cuando existe, está en `capas/`.
- **Los textos están hechos con ayuda de modelos de lenguaje** a partir de fuentes públicas y de las notas de los autores; las traducciones parten del español y pueden tener errores. Si ves uno, corrígelo (ver [CONTRIBUTING.md](CONTRIBUTING.md)).
- **Las fotos no están aquí.** Cada ficha referencia la página de la foto en Wikimedia Commons con su autor y licencia.
- **No se publican** citas literales de las fuentes, contactos ni ubicaciones precisas de nidos, madrigueras o dormideros. Ver [POLITICA_EDITORIAL.md](POLITICA_EDITORIAL.md).

## Cómo se comprueba

Cada cambio pasa por `npm run validar` (esquema, identificadores, referencias a especies y hábitats, capas, licencias de fotos, ubicaciones) y las descargas se regeneran con `npm run descargas`. Cada semana se revisan los enlaces y las fotos en Commons y se abre una incidencia si algo falla.

```bash
npm install
npm run validar            # añade -- --paises para comprobar que las coordenadas caen en su país
npm run descargas
```

Los avisos conocidos de `--paises` son islas o archipiélagos (Alderney, Desertas, Selvagens, Åland, St Kilda) que quedan fuera de los polígonos de referencia.

## Contenido de este repositorio frente a la web

La web se construye desde otro repositorio privado; este es una publicación revisada de sus contenidos. Las propuestas aceptadas aquí se trasladan a la web. Hoy no hay sincronización automática: puede pasar algún tiempo entre un cambio aceptado y su aparición en wildatlas.eu.
