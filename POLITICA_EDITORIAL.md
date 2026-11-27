# Política editorial

## Qué entra
Territorios bien conservados, con hábitats y procesos naturales destacados, que sean un destino concreto y delimitable (parque, reserva, sector o paisaje con límites claros), con fuentes oficiales o científicas comprobables y ficha propia. Los programas, redes y proyectos de conservación se tratan como información relacionada con los lugares donde actúan, no como lugares. La restauración ecológica puede entrar como excepción cuando sus resultados actuales lo justifican. Los criterios completos, en lenguaje llano, están en <https://wildatlas.eu/criterios/>. La lista no está cerrada y sigue evolucionando.

## Qué se publica de cada ficha (lista cerrada de campos)
Los campos son los del [esquema](schema/lugar.schema.json). **No se publican:** citas literales de las fuentes, notas internas de investigación, datos de contacto, correos ni nombres de colaboradores sin su permiso, fotos (solo referencias a Commons) ni ubicaciones precisas de nidos, madrigueras, dormideros o poblaciones sensibles.

## Estado editorial (`estado_editorial`)
No es el estado de conservación del espacio. Indica cuánto se ha revisado la ficha.

| Valor | Significado |
|---|---|
| `pendiente-de-revision` | Ficha heredada: su valoración original aún no se ha contrastado con la rúbrica |
| `en-revision` | Alguien la está revisando |
| `valoracion-revisada` | Su valoración se ha contrastado con la rúbrica y la fuente |
| `desactualizada` | Un dato conocido ha cambiado y falta actualizarlo |

## Reglas de redacción
- **Fuente y paráfrasis.** Cada dato se contrasta con una fuente oficial o científica y se redacta con palabras propias. No se copian textos de webs de parques ni de otras obras. La cita literal, si es imprescindible, es breve y va entre comillas con su fuente.
- **Textos con ayuda de modelos de lenguaje.** Se permiten para mejorar y traducir, siempre a partir de fuentes y con revisión humana de quien los aporta. Quien contribuye responde de lo que envía.
- **Sin dato.** Si un dato no consta, se deja vacío: preferimos «sin dato» a una cifra inventada.
- **Fotos.** Solo con licencia libre en Wikimedia Commons (CC0, CC BY, CC BY-SA, dominio público), referenciadas por su página, con autor y licencia.
- **Ubicaciones.** Un círculo o punto estimado no es una entrada ni un sendero. Los contornos proceden de fuentes oficiales o de OpenStreetMap y están en `capas/`.

## Quién revisa
Hoy, una sola persona (quien mantiene el repositorio). Cuando haya volumen y revisores recurrentes, se podrá delegar la revisión por país o región con `CODEOWNERS`.
