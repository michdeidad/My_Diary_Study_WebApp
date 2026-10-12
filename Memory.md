# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- v1 + mejor racha + borrado manual + resumen semanal + material por sesión: registrar
sesiones (con enlace opcional), racha actual (🔥), mejor racha (🏆), minutos y sesiones
de lunes a hoy, lista con botón "Eliminar".
- Datos en localStorage, clave `diario-estudio-sesiones`.
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
## Aprendizajes y errores a evitar
- Filtrar fechas futuras (`date <= hoy`) antes de calcular rachas; si no, suman días que
aún no existen.
- Comparar fechas como texto `AAAA-MM-DD` con `<=` y `sort()` funciona porque el orden
alfabético coincide con el cronológico.
- Comparar `s.id !== Number(boton.dataset.id)`: el dataset llega como texto.
- Los enlaces de usuario solo se pintan como `<a>` si empiezan por `http://` o `https://`
(`isSafeHttpUrl()`); si no, se muestran como texto para evitar `javascript:`.
## Próximos pasos
- (vacío por ahora) 