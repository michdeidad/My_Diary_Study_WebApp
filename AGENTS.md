# AGENTS.md — Diario de Estudio
Web estática para registrar sesiones de estudio y motivarse viendo la racha de días
seguidos. Proyecto didáctico: el código debe poder entenderlo alguien que empieza a
programar.
## Stack y estructura
- HTML, CSS y JavaScript puros: sin frameworks, librerías, npm, bundler ni build.
- `index.html` (estructura), `styles.css` (estilos), `app.js` (lógica y datos).
- Debe funcionar abriendo `index.html` con doble clic (`file://`): nada de módulos ES
(`type="module"`), `fetch` a archivos locales ni nada que requiera servidor.
## Convenciones
- Textos de la interfaz en español.
- Código simple, nombres descriptivos y comentarios solo donde aporten.
- Diseño limpio y responsive; cualquier pantalla nueva debe verse bien en el móvil.
## Datos
- localStorage, clave `diario-estudio-sesiones`: array de `{ date: "AAAA-MM-DD", topic,
minutes }`.
- Si cambias la forma de los datos, mantén compatibilidad con lo ya guardado o el usuario
perderá sus sesiones.
## Fechas y racha (fácil equivocarse)
- Trabaja siempre con la fecha local del usuario. Nunca uses `toISOString()` ni `new
Date("AAAA-MM-DD")`: se interpretan en UTC y desplazan el día.
- Racha = días consecutivos con al menos 1 sesión que terminan hoy. Si hoy no hay sesión
pero ayer sí, la racha sigue viva y se cuenta desde ayer.
- Varias sesiones el mismo día cuentan como un solo día. Las fechas futuras no suman.
## Forma de trabajar
- Haz solo lo que se pide: no añadas funcionalidades por tu cuenta.
- Cambios pequeños y enfocados; no reescribas lo que ya funciona.
- Al terminar, resume qué has cambiado y cualquier decisión que deba revisar.
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones
tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su
porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de
dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales). 
## Límites
- ✅ Siempre: respetar las reglas de fechas y racha, mantener los textos en español.
- ✅ Siempre: actualizar `MEMORY.md` al terminar cada tarea. 
- ⚠️ Pregunta antes: crear archivos nuevos, cambiar el formato de los datos guardados.
- 🚫 Nunca: añadir dependencias, frameworks o un paso de build.
## Verificación
- No hay tests ni lint. Probar abriendo `index.html` en el navegador.
- Para empezar de cero: DevTools → Application → Local Storage → borrar la clave
`diario-estudio-sesiones`. 
# 🤖 Directrices del Agente OpenCode - Flujo de Trabajo Git

Como agente de desarrollo integrado en OpenCode, tu objetivo principal es implementar soluciones limpias y mantener el repositorio sincronizado mediante el uso estricto del control de versiones.

## 🔄 Protocolo Obligatorio al Finalizar Tareas
Cada vez que concluyas una tarea de código, una corrección de bugs o una implementación solicitada por el usuario, debes seguir rigurosamente este flujo:

1. **Revisión de Cambios:**
   - Ejecuta `git status` para identificar los archivos modificados o creados.
   - Analiza los cambios con `git diff` para asegurarte de que solo incluyes lo necesario y que no hay errores de sintaxis o credenciales expuestas.

2. **Preparación del Commit:**
   - Agrega los archivos correspondientes al área de preparación usando `git add <archivos>` (evita añadir archivos de configuración local como `opencode.json` o variables de entorno).

3. **Creación del Commit:**
   - Redacta un mensaje de commit claro y estructurado siguiendo las convenciones (Conventional Commits):
     - `feat: [descripción]` para nuevas funcionalidades.
     - `fix: [descripción]` para corrección de errores.
     - `refactor: [descripción]` para mejoras de código sin cambiar la funcionalidad.
   - Comando: `git commit -m "tipo: descripción detallada de los cambios realizados"`

4. **Envío al Repositorio Remoto (Push):**
   - Envía los cambios a la rama principal o de trabajo actual en GitHub:
     - `git push origin main` (o la rama activa correspondiente).

---
*Nota: Nunca omitas este paso de sincronización a menos que el usuario lo indique explícitamente.*


