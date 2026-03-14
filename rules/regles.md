# Regles del Projecte

---
trigger: always_on
---

- Las pruebas las hago yo siempre, tú me indicas qué probar.
- Todo lo que haga un agente, lo documentas en la carpeta docs. No vas creando infinitos documentos, modificas los existentes relacionados con la tarea encargada. Sólo si crees que no encaja en alguna, creas un nuevo doc.
- La carpeta docs debe estar dentro de la carpeta del proyecto de trabajo.
- Cualquier petición, antes consultas la carpeta docs para situarte.
- **MUY IMPORTANTE**: Trabaja SIEMPRE única y exclusivamente en la rama `development`. Usa la base de datos de desarrollo y el entorno de desarrollo. NUNCA toques `preprod` o `main` (producción) a menos que se te pida explícitamente desplegar o hacer un merge.
- Siempre hazlo todo que sea responsive y mobile first
- El flujo de trabajo y despliegue es: `development` (desarrollo local/agentes) -> `preprod` (entorno de pruebas en servidor) -> `main` (producción).