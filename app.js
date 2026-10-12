/**
 * DIARIO DE ESTUDIO - Lógica de la aplicación
 * Escrito de forma clara, didáctica y estructurada para desarrolladores principiantes.
 */

// Key única para guardar nuestros datos en el localStorage del navegador (según AGENTS.md)
const LOCAL_STORAGE_KEY = 'diario-estudio-sesiones';
// Key aparte para recordar el tema claro/oscuro (no altera el formato de las sesiones)
const THEME_STORAGE_KEY = 'diario-estudio-tema';

// --- FUNCIONES DE FECHAS (Usando siempre hora local para evitar desfases de zona horaria) ---

/**
 * Obtiene la fecha de hoy en formato local "YYYY-MM-DD"
 */
function getTodayLocalDateString() {
  const hoy = new Date();
  const year = hoy.getFullYear();
  // padStart asegura que los meses menores de 10 tengan dos dígitos (ej. "05" en vez de "5")
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Suma o resta días a una fecha dada ("YYYY-MM-DD") de manera segura en zona horaria local
 * @param {string} baseDateStr - Fecha base en formato "YYYY-MM-DD"
 * @param {number} offsetDays - Días a sumar (positivo) o restar (negativo)
 * @returns {string} Nueva fecha en formato "YYYY-MM-DD"
 */
function getOffsetDateString(baseDateStr, offsetDays) {
  // Dividimos la fecha por guiones para extraer año, mes y día
  const [year, month, day] = baseDateStr.split('-').map(Number);
  // Al crear el objeto Date de esta forma (año, mes indexado en 0, día), el navegador lo crea en la hora local del usuario
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + offsetDays);
  
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Convierte una fecha "YYYY-MM-DD" al formato legible en español "DD/MM/YYYY"
 */
function formatFecha(fechaStr) {
  const [year, month, day] = fechaStr.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Comprueba que un enlace use http o https (evita enlaces peligrosos tipo javascript:).
 */
function isSafeHttpUrl(url) {
  return url.startsWith('http://') || url.startsWith('https://');
}


// --- LÓGICA DE ALMACENAMIENTO (LocalStorage) ---

/**
 * Obtiene la lista de sesiones de localStorage. Si no existe, devuelve una lista vacía.
 */
function getSessionsFromStorage() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Guarda la lista de sesiones en localStorage.
 */
function saveSessionsToStorage(sessions) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
}


// --- CÁLCULO DE LA RACHA ACTIVA Y MEJOR RACHA ---

/**
 * Calcula los días consecutivos con estudio que terminan hoy.
 * Si hoy no se ha estudiado pero ayer sí, la racha sigue viva (no se rompe).
 */
function calculateStreak(sessions) {
  if (sessions.length === 0) return 0;

  // Creamos un Set con todas las fechas que tienen al menos una sesión de estudio.
  const studiedDates = new Set(sessions.map(s => s.date));
  
  const todayStr = getTodayLocalDateString();
  const yesterdayStr = getOffsetDateString(todayStr, -1);

  let startStr = null;

  // 1. Decidimos desde qué fecha empezamos a contar hacia atrás:
  if (studiedDates.has(todayStr)) {
    startStr = todayStr;
  } else if (studiedDates.has(yesterdayStr)) {
    startStr = yesterdayStr;
  } else {
    return 0;
  }

  let streak = 0;
  let currentDateStr = startStr;

  // 2. Contamos días consecutivos hacia atrás mientras existan en nuestro Set de estudio
  while (studiedDates.has(currentDateStr)) {
    streak++;
    currentDateStr = getOffsetDateString(currentDateStr, -1);
  }

  return streak;
}

/**
 * Calcula la racha más larga de días consecutivos conseguida nunca (excluyendo fechas futuras).
 */
function calculateBestStreak(sessions) {
  if (sessions.length === 0) return 0;

  const todayStr = getTodayLocalDateString();

  // 1. Filtrar fechas futuras y extraer días únicos en orden ascendente
  const uniqueDates = [...new Set(sessions.map(s => s.date))]
    .filter(dateStr => dateStr <= todayStr)
    .sort();

  if (uniqueDates.length === 0) return 0;

  let bestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = uniqueDates[i - 1];
    const currDate = uniqueDates[i];

    if (currDate === getOffsetDateString(prevDate, 1)) {
      currentStreak++;
    } else {
      currentStreak = 1;
    }

    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }
  }

  // Garantizamos que la mejor racha sea al menos igual a la racha actual calculada
  const activeStreak = calculateStreak(sessions);
  return Math.max(bestStreak, activeStreak);
}


// --- RENDERIZADO / INTERFAZ ---

/**
 * Dibuja la racha actual y la mejor racha en pantalla, actualizando el mensaje motivacional.
 */
function updateStreakDisplay(streak, bestStreak) {
  const streakNumberEl = document.getElementById('streak-number');
  const bestStreakNumberEl = document.getElementById('best-streak-number');
  const streakTextEl = document.getElementById('streak-text');

  // Mostramos los valores
  streakNumberEl.textContent = streak;
  bestStreakNumberEl.textContent = bestStreak;

  // Mensaje motivacional según el nivel de racha
  if (streak === 0) {
    streakTextEl.textContent = '¡Comienza a estudiar hoy para empezar tu racha!';
  } else if (streak === 1) {
    streakTextEl.textContent = '¡Racha de 1 día iniciada! Sigue estudiando mañana para no perderla.';
  } else {
    streakTextEl.textContent = `¡Excelente! Llevas ${streak} días seguidos de estudio. ¡Sigue así!`;
  }
}

/**
 * Dibuja la lista de sesiones en el historial, ordenadas de más reciente a más antigua.
 */
function renderSessionsList(sessions) {
  const listEl = document.getElementById('sessions-list');
  const emptyEl = document.getElementById('sessions-empty');

  // Limpiamos la lista actual para redibujarla desde cero
  listEl.innerHTML = '';

  if (sessions.length === 0) {
    emptyEl.style.display = 'block';
    return;
  }

  // Ocultamos el estado vacío si hay sesiones
  emptyEl.style.display = 'none';

  // Copiamos la lista y la ordenamos de la más reciente a la más antigua.
  // Usamos slice() o [...] para no alterar el orden original del array principal de sesiones.
  const sortedSessions = [...sessions].sort((a, b) => {
    // 1. Comparamos las fechas en formato texto ("YYYY-MM-DD").
    // Al ser un formato estándar ISO, .localeCompare los ordena cronológicamente.
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date); // Orden descendente (más nueva primero)
    }
    // 2. Si se hicieron en la misma fecha, mostramos primero la que se registró más recientemente en el tiempo (por ID)
    return b.id - a.id;
  });

  // Generamos el HTML de forma segura usando elementos de DOM para evitar problemas de XSS (inyección de código malo)
  sortedSessions.forEach(session => {
    const li = document.createElement('li');
    li.className = 'session-item';

    // Bloque izquierdo con el título del tema y la fecha formateada
    const infoDiv = document.createElement('div');
    infoDiv.className = 'session-info';

    const topicSpan = document.createElement('span');
    topicSpan.className = 'session-topic';
    topicSpan.textContent = session.topic;

    const dateSpan = document.createElement('span');
    dateSpan.className = 'session-date';
    dateSpan.textContent = formatFecha(session.date);

    infoDiv.appendChild(topicSpan);
    infoDiv.appendChild(dateSpan);

    // Enlace al material de estudio, solo si la sesión lo tiene (compatible con
    // sesiones antiguas guardadas sin este campo)
    const materialUrl = (session.material || '').trim();
    if (materialUrl !== '') {
      if (isSafeHttpUrl(materialUrl)) {
        const materialLink = document.createElement('a');
        materialLink.className = 'session-link';
        materialLink.textContent = 'Ver material';
        materialLink.href = materialUrl;
        materialLink.target = '_blank';
        materialLink.rel = 'noopener';
        infoDiv.appendChild(materialLink);
      } else {
        const materialText = document.createElement('span');
        materialText.className = 'session-link';
        materialText.textContent = materialUrl;
        infoDiv.appendChild(materialText);
      }
    }

    // Bloque derecho con los minutos y el botón de eliminar
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'session-actions';

    const timeSpan = document.createElement('span');
    timeSpan.className = 'session-time';
    timeSpan.textContent = `${session.minutes} min`;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.dataset.id = session.id;
    deleteBtn.setAttribute('aria-label', `Eliminar sesión de ${session.topic} del ${formatFecha(session.date)}`);

    actionsDiv.appendChild(timeSpan);
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(infoDiv);
    li.appendChild(actionsDiv);

    listEl.appendChild(li);
  });
}

/**
 * Elimina una sesión por su id, guarda los cambios y actualiza la pantalla.
 */
function deleteSessionById(id) {
  const sessions = getSessionsFromStorage();
  const restantes = sessions.filter(s => s.id !== Number(id));
  saveSessionsToStorage(restantes);
  updateApp();
}

// --- TOTAL SEMANAL (de lunes a hoy, en fecha local) ---

/**
 * Obtiene el lunes de la semana actual en formato "YYYY-MM-DD" (semana de lunes a domingo).
 */
function getWeekStartLocalDateString(todayStr) {
  const [year, month, day] = todayStr.split('-').map(Number);
  const weekday = new Date(year, month - 1, day).getDay(); // 0 = domingo, 1 = lunes, ...
  const daysSinceMonday = (weekday + 6) % 7;
  return getOffsetDateString(todayStr, -daysSinceMonday);
}

/**
 * Suma los minutos de las sesiones desde el lunes hasta hoy (sin contar fechas futuras).
 */
function calculateWeekMinutes(sessions) {
  const todayStr = getTodayLocalDateString();
  const weekStartStr = getWeekStartLocalDateString(todayStr);
  let total = 0;
  sessions.forEach(s => {
    if (s.date >= weekStartStr && s.date <= todayStr) {
      total += Number(s.minutes) || 0;
    }
  });
  return total;
}

/**
 * Cuenta las sesiones desde el lunes hasta hoy (sin contar fechas futuras).
 */
function calculateWeekSessions(sessions) {
  const todayStr = getTodayLocalDateString();
  const weekStartStr = getWeekStartLocalDateString(todayStr);
  let total = 0;
  sessions.forEach(s => {
    if (s.date >= weekStartStr && s.date <= todayStr) {
      total++;
    }
  });
  return total;
}

/**
 * Muestra el resumen de la semana (minutos y sesiones) en pantalla.
 */
function updateWeekDisplay(totalMinutes, totalSessions) {
  document.getElementById('week-minutes-number').textContent = totalMinutes;
  document.getElementById('week-sessions-number').textContent = totalSessions;
}

/**
 * Ejecuta el recálculo y actualización visual completa de toda la aplicación.
 */
function updateApp() {
  const sessions = getSessionsFromStorage();
  const streak = calculateStreak(sessions);
  const bestStreak = calculateBestStreak(sessions);

  updateStreakDisplay(streak, bestStreak);
  updateWeekDisplay(calculateWeekMinutes(sessions), calculateWeekSessions(sessions));
  renderSessionsList(sessions);
}


// --- TEMPORIZADOR DE ESTUDIO (cuenta hacia arriba, vuelca minutos al formulario) ---

// Segundos acumulados y referencia al intervalo activo (null cuando está detenido)
let timerSeconds = 0;
let timerInterval = null;

/**
 * Convierte segundos a texto "HH:MM:SS" con ceros a la izquierda.
 */
function formatTimerDisplay(totalSeconds) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Pinta el tiempo actual en cada segmento del widget (HH, MM, SS).
 */
function updateTimerDisplay() {
  const parts = formatTimerDisplay(timerSeconds).split(':');
  document.getElementById('timer-hh').textContent = parts[0];
  document.getElementById('timer-mm').textContent = parts[1];
  document.getElementById('timer-ss').textContent = parts[2];
}


// --- TEMA CLARO / OSCURO (se guarda en localStorage para recordarlo) ---

/**
 * Aplica el tema ("light" o "dark") al <html> y actualiza el botón flotante.
 */
function applyTheme(theme) {
  const normalized = theme === 'dark' ? 'dark' : 'light';
  const label = normalized === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
  document.documentElement.dataset.theme = normalized;
  localStorage.setItem(THEME_STORAGE_KEY, normalized);
  const themeButton = document.getElementById('theme-toggle');
  themeButton.textContent = normalized === 'dark' ? '☀️' : '🌙';
  themeButton.setAttribute('aria-label', label);
  themeButton.title = label;
}

/**
 * Cambia al tema contrario del actual.
 */
function toggleTheme() {
  const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

/**
 * Empieza a contar (si ya está en marcha, no hace nada).
 */
function startTimer() {
  if (timerInterval !== null) return;
  timerInterval = setInterval(() => {
    timerSeconds++;
    updateTimerDisplay();
  }, 1000);
}

/**
 * Detiene el conteo manteniendo el tiempo acumulado (para continuar después).
 */
function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

/**
 * Detiene y vuelve a cero.
 */
function resetTimer() {
  stopTimer();
  timerSeconds = 0;
  updateTimerDisplay();
}

/**
 * Pasa los minutos acumulados al campo "Minutos estudiados" del formulario.
 * El usuario completa fecha, tema y material y guarda como siempre.
 */
function sendTimerToForm() {
  const minutes = Math.floor(timerSeconds / 60);
  if (minutes < 1) {
    alert('El temporizador aún no llega a 1 minuto. Sigue estudiando un poco más.');
    return;
  }
  document.getElementById('minutos').value = minutes;
  // Llevamos al usuario al formulario para que complete el resto y pulse "Añadir Sesión"
  // (sin desplazamiento animado si el usuario prefiere movimiento reducido)
  const smoothScroll = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  document.getElementById('session-form').scrollIntoView({ behavior: smoothScroll, block: 'center' });
  document.getElementById('tema').focus();
}


// --- CONFIGURACIÓN DE EVENTOS AL INICIAR LA PÁGINA ---

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('session-form');
  const fechaInput = document.getElementById('fecha');

  // 0. Aplicar el tema guardado (por defecto claro) antes de pintar nada
  applyTheme(localStorage.getItem(THEME_STORAGE_KEY) || 'light');
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // 1. Establecer por defecto la fecha de hoy en el campo del formulario
  fechaInput.value = getTodayLocalDateString();

  // 2. Escuchar el envío del formulario para registrar una nueva sesión
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Evitamos que la página se recargue solo al enviar

    const fechaVal = fechaInput.value;
    const temaVal = document.getElementById('tema').value.trim();
    const minutosVal = parseInt(document.getElementById('minutos').value, 10);
    const materialVal = document.getElementById('material').value.trim();

    // Validaciones de seguridad por si acaso
    if (!fechaVal || !temaVal || isNaN(minutosVal) || minutosVal <= 0) {
      alert('Por favor, rellena todos los campos correctamente. Los minutos deben ser mayores a 0.');
      return;
    }

    // Creamos la nueva sesión con la estructura exacta de AGENTS.md
    const newSession = {
      id: Date.now(), // Usamos la marca de tiempo exacta como ID único (útil para ordenar en un mismo día)
      date: fechaVal,
      topic: temaVal,
      minutes: minutosVal,
      material: materialVal // Enlace opcional; puede quedar vacío
    };

    // Cargamos sesiones existentes, añadimos la nueva y guardamos de vuelta
    const sessions = getSessionsFromStorage();
    sessions.push(newSession);
    saveSessionsToStorage(sessions);

    // Reseteamos el formulario y restauramos la fecha por defecto (hoy)
    form.reset();
    fechaInput.value = getTodayLocalDateString();

    // Actualizamos toda la interfaz de usuario con los nuevos datos
    updateApp();
  });

  // 3. Delegación para eliminar: un solo listener en la lista (sobrevive al redibujado)
  document.getElementById('sessions-list').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-delete');
    if (!btn) return;
    if (!confirm('¿Eliminar esta sesión? Esta acción no se puede deshacer.')) return;
    deleteSessionById(btn.dataset.id);
  });

  // 4. Renderizado inicial de la aplicación al abrirla
  updateApp();

  // 5. Temporizador: botones de empezar, detener, reiniciar y pasar minutos al formulario
  document.getElementById('timer-start').addEventListener('click', startTimer);
  document.getElementById('timer-stop').addEventListener('click', stopTimer);
  document.getElementById('timer-reset').addEventListener('click', resetTimer);
  document.getElementById('timer-add').addEventListener('click', sendTimerToForm);
  updateTimerDisplay();
});
