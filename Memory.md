# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- v1 + mejor racha + borrado manual + resumen semanal + material por sesión: registrar
sesiones (con enlace opcional), racha actual (🔥), mejor racha (🏆), minutos y sesiones
de lunes a hoy, lista con botón "Eliminar".
- Datos en localStorage, clave `diario-estudio-sesiones`.
- Skill de fechas en `.agents/skills/local-dates/SKILL.md` (ID `local-dates`): usar siempre al tocar fechas/rachas.
- Temporizador en tarjeta `.timer-card` debajo de la racha (en flujo, sin superposición): HH:MM:SS con Empezar/Detener/Reiniciar y botón `+` que vuelca minutos (redondeo hacia abajo) al campo `Minutos estudiados`. Claro: tarjeta blanca con verde; oscuro: estilo gaming negro/verde.
- Tema claro/oscuro con botón flotante `#theme-toggle` abajo a la derecha (clave `diario-estudio-tema`).
## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- Mejor racha calculada al vuelo con `calculateBestStreak()`: evita desincronización y no
cambia el formato de los datos guardados.
- Borrado por `id` con delegación en `#sessions-list`: la lista se redibuja en cada
`updateApp()`, un listener por botón se perdería.
- Confirmación con `confirm()` nativo: funciona en `file://` sin modales ni dependencias.
- Semana de lunes a domingo con `calculateWeekMinutes()` y `calculateWeekSessions()`:
minutos y número de sesiones desde el lunes hasta hoy; las fechas futuras no suman
(igual que en la racha).
- Material como campo opcional `material` por sesión (solo texto/enlace, nada binario:
los PDFs no caben en los ~5MB de localStorage). Las sesiones antiguas sin ese campo
siguen funcionando (`session.material || ''`).
- Temporizador sin guardar nada por sí solo: el `+` solo rellena `#minutos` para no
cambiar el formato de datos ni duplicar la validación del formulario.
- El tema se guarda en una clave propia (`diario-estudio-tema`): no toca el formato de `diario-estudio-sesiones`.
- Diseño "papel y tinta" (skill `frontend-design`): fondo papel y serif del sistema en titulares/cifras, sin dependencias; entrenido: MAYÚSCULAS decorativas fuera, foco visible y `prefers-reduced-motion` respetado.
## Aprendizajes y errores a evitar
- Filtrar fechas futuras (`date <= hoy`) antes de calcular rachas; si no, suman días que
aún no existen.
- Comparar fechas como texto `AAAA-MM-DD` con `<=` y `sort()` funciona porque el orden
alfabético coincide con el cronológico.
- Comparar `s.id !== Number(boton.dataset.id)`: el dataset llega como texto.
- Los enlaces de usuario solo se pintan como `<a>` si empiezan por `http://` o `https://`
(`isSafeHttpUrl()`); si no, se muestran como texto para evitar `javascript:`.
- La skill solo se descubre si el archivo se llama `SKILL.md` en mayúsculas (no `skill.md`).
## Próximos pasos
- (vacío por ahora) 