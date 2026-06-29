// ============================================================
// app.js — UniNorte Evaluation Form v3 (Cascading Selects)
// ============================================================

const STORAGE_KEY = "uninorte_evaluaciones_v2";
const MAX_PHOTOS_PER_DIM = 2;
const PHOTO_MAX_SIZE = 1024;   // Max dimension in pixels
const PHOTO_QUALITY = 0.5;     // JPEG quality (0-1)
const STORAGE_WARN_PCT = 80;   // Warn when storage is X% full

// Safe storage wrapper (iOS WebKit blocks localStorage in some contexts)
let memoryStore = {};
const appStorage = {
  getItem(key) {
    try { return window.localStorage.getItem(key); }
    catch (e) { return memoryStore[key] || null; }
  },
  setItem(key, val) {
    try { window.localStorage.setItem(key, val); }
    catch (e) { memoryStore[key] = val; }
  },
  removeItem(key) {
    try { window.localStorage.removeItem(key); }
    catch (e) { delete memoryStore[key]; }
  }
};

// In-memory photo store for current evaluation (dimId -> [base64, ...])
let currentPhotos = {};
// Track which dimension is requesting a photo
let activePhotoDimId = null;

// ===== DOM Elements =====
const form = document.getElementById("evalForm");
const categoriaSelect = document.getElementById("categoria");
const edificioSelect = document.getElementById("edificio");
const codigoSelect = document.getElementById("codigo");
const pisoInput = document.getElementById("piso");
const nombreInput = document.getElementById("nombre");
const evaluadorInput = document.getElementById("evaluador");
const cargoInput = document.getElementById("cargo");
const dimensionsSection = document.getElementById("dimensionsSection");
const dimensionsContainer = document.getElementById("dimensionsContainer");
const catIcon = document.getElementById("catIcon");
const catTitle = document.getElementById("catTitle");
const resultSection = document.getElementById("resultSection");
const scoreValue = document.getElementById("scoreValue");
const resultBadge = document.getElementById("resultBadge");
const resultAction = document.getElementById("resultAction");
const resultCard = document.getElementById("resultCard");
const obsSection = document.getElementById("obsSection");
const formActions = document.getElementById("formActions");
const emptyState = document.getElementById("emptyState");
const accionesGroup = document.getElementById("accionesGroup");
const evalCount = document.getElementById("evalCount");
const toast = document.getElementById("toast");
const photoInput = document.getElementById("photoInput");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const storageFill = document.getElementById("storageFill");
const storageText = document.getElementById("storageText");

// Drawer
const historyDrawer = document.getElementById("historyDrawer");
const drawerOverlay = document.getElementById("drawerOverlay");
const historyList = document.getElementById("historyList");
const drawerStats = document.getElementById("drawerStats");

// Track whether the current category has ESPACIOS data
let currentCatHasEspacios = false;

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  populateCategories();
  setDefaults();
  loadEvaluadorData();
  updateBadgeCount();
  updateStorageIndicator();
  bindEvents();
});

function initTheme() {
  const saved = localStorage.getItem("uninorte_theme");
  if (saved === "light") document.documentElement.setAttribute("data-theme", "light");
  updateThemeIcon();
}

function toggleTheme() {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  if (isLight) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("uninorte_theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("uninorte_theme", "light");
  }
  updateThemeIcon();
}

function updateThemeIcon() {
  const btn = document.getElementById("btnTheme");
  if (btn) btn.textContent = document.documentElement.getAttribute("data-theme") === "light" ? "☀️" : "🌙";
}

function populateCategories() {
  CATEGORIES.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = `${cat.icon} ${cat.name}`;
    categoriaSelect.appendChild(opt);
  });
}

function setDefaults() {
  const now = new Date();
  document.getElementById("fecha").value = now.toISOString().split("T")[0];
  document.getElementById("hora").value = now.toTimeString().slice(0, 5);
}

// ===== Evaluador Persistence =====
function loadEvaluadorData() {
  try {
    const ev = appStorage.getItem("uninorte_evaluador");
    const ca = appStorage.getItem("uninorte_cargo");
    if (ev) evaluadorInput.value = ev;
    if (ca) cargoInput.value = ca;
  } catch (e) { /* ignore */ }
}

function saveEvaluadorData() {
  try {
    const ev = evaluadorInput.value.trim();
    const ca = cargoInput.value.trim();
    if (ev) appStorage.setItem("uninorte_evaluador", ev);
    if (ca) appStorage.setItem("uninorte_cargo", ca);
  } catch (e) { /* ignore */ }
}

// ===== Event Bindings =====
function bindEvents() {
  categoriaSelect.addEventListener("change", onCategoryChange);
  edificioSelect.addEventListener("change", onEdificioChange);
  codigoSelect.addEventListener("change", onCodigoChange);
  form.addEventListener("submit", onSubmit);
  form.addEventListener("reset", onReset);

  // Theme toggle
  document.getElementById("btnTheme").addEventListener("click", toggleTheme);

  // Photo input
  photoInput.addEventListener("change", onPhotoSelected);

  // Lightbox
  document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

  // Drawer
  document.getElementById("btnHistory").addEventListener("click", openDrawer);
  document.getElementById("btnCloseDrawer").addEventListener("click", closeDrawer);
  drawerOverlay.addEventListener("click", closeDrawer);

  // Export/Import
  document.getElementById("btnExportCSV").addEventListener("click", exportCSV);
  document.getElementById("btnExportJSON").addEventListener("click", exportJSON);
  document.getElementById("btnImportTrigger").addEventListener("click", () => {
    document.getElementById("btnImport").click();
  });
  document.getElementById("btnImport").addEventListener("change", importFile);
  document.getElementById("btnClearAll").addEventListener("click", clearAll);
}

// ===== Category Change =====
function onCategoryChange() {
  const catId = categoriaSelect.value;
  currentPhotos = {}; // Reset photos when category changes

  // Reset cascaded fields
  resetCascade();

  if (!catId) {
    dimensionsSection.style.display = "none";
    resultSection.style.display = "none";
    obsSection.style.display = "none";
    formActions.style.display = "none";
    emptyState.style.display = "block";
    return;
  }

  const cat = CATEGORIES.find(c => c.id === catId);
  if (!cat) return;

  // Populate edificio dropdown from ESPACIOS
  const espaciosCat = (typeof ESPACIOS !== 'undefined') ? ESPACIOS.filter(e => e.cat === catId) : [];
  currentCatHasEspacios = espaciosCat.length > 0;

  if (currentCatHasEspacios) {
    // Get unique edificios sorted
    const edificios = [...new Set(espaciosCat.map(e => e.ed))].sort();
    edificioSelect.innerHTML = '<option value="">— Seleccionar edificio —</option>';
    edificios.forEach(ed => {
      const opt = document.createElement("option");
      opt.value = ed;
      opt.textContent = ed;
      edificioSelect.appendChild(opt);
    });
    edificioSelect.disabled = false;
    codigoSelect.innerHTML = '<option value="">— Seleccione edificio primero —</option>';
    codigoSelect.disabled = true;
  } else {
    // Category without ESPACIOS data — convert to free text inputs
    swapToTextInput('edificioGroup', 'edificio', 'Ej: Bloque K1');
    swapToTextInput('codigoGroup', 'codigo', 'Ej: AUD-01');
  }

  pisoInput.value = '';
  nombreInput.value = '';

  emptyState.style.display = "none";
  dimensionsSection.style.display = "block";
  resultSection.style.display = "block";
  obsSection.style.display = "block";
  formActions.style.display = "flex";

  catIcon.textContent = cat.icon;
  catTitle.textContent = cat.name;

  renderDimensions(cat);
  updateResult();
}

// ===== Edificio Change (cascade step 2) =====
function onEdificioChange() {
  const catId = categoriaSelect.value;
  const edValue = edificioSelect.value;

  // Reset downstream
  pisoInput.value = '';
  nombreInput.value = '';

  if (!edValue || !currentCatHasEspacios) {
    codigoSelect.innerHTML = '<option value="">— Seleccione edificio primero —</option>';
    codigoSelect.disabled = true;
    return;
  }

  // Filter ESPACIOS by cat + edificio
  const matched = ESPACIOS.filter(e => e.cat === catId && e.ed === edValue);
  const codigos = matched.sort((a, b) => a.cod.localeCompare(b.cod));

  codigoSelect.innerHTML = '<option value="">— Seleccionar código —</option>';
  codigos.forEach(esp => {
    const opt = document.createElement("option");
    opt.value = esp.cod;
    opt.textContent = `${esp.cod} — ${esp.nom}`;
    codigoSelect.appendChild(opt);
  });
  codigoSelect.disabled = false;
}

// ===== Codigo Change (cascade step 3 — auto-fill) =====
function onCodigoChange() {
  const catId = categoriaSelect.value;
  const codValue = codigoSelect.value;

  if (!codValue || !currentCatHasEspacios) {
    pisoInput.value = '';
    nombreInput.value = '';
    return;
  }

  const esp = ESPACIOS.find(e => e.cat === catId && e.cod === codValue);
  if (esp) {
    pisoInput.value = esp.piso || '';
    nombreInput.value = esp.nom || '';
    // If piso is empty, hint user they can fill it manually
    if (!esp.piso) {
      pisoInput.placeholder = 'Diligenciar manualmente';
    } else {
      pisoInput.placeholder = 'Se auto-rellena';
    }
  }
}

// ===== Helper: Reset Cascade Fields =====
function resetCascade() {
  // Restore edificio and codigo as <select> if they were swapped to <input>
  restoreSelect('edificioGroup', 'edificio', '— Seleccione categoría primero —');
  restoreSelect('codigoGroup', 'codigo', '— Seleccione edificio primero —');
  // Re-acquire references in case they were replaced
  // (We use getElementById so these always point to the current element)
  pisoInput.value = '';
  nombreInput.value = '';
}

// Swap a <select> to a <input type="text"> inside its group
function swapToTextInput(groupId, fieldId, placeholder) {
  const group = document.getElementById(groupId);
  const existing = document.getElementById(fieldId);
  if (existing && existing.tagName === 'INPUT') return; // already swapped
  const input = document.createElement('input');
  input.type = 'text';
  input.id = fieldId;
  input.placeholder = placeholder;
  if (existing) existing.replaceWith(input);
}

// Restore a text <input> back to a <select>
function restoreSelect(groupId, fieldId, defaultText) {
  const existing = document.getElementById(fieldId);
  if (existing && existing.tagName === 'SELECT') {
    // Already a select, just reset it
    existing.innerHTML = `<option value="">${defaultText}</option>`;
    existing.disabled = true;
    return;
  }
  const select = document.createElement('select');
  select.id = fieldId;
  select.disabled = true;
  select.innerHTML = `<option value="">${defaultText}</option>`;
  if (existing) existing.replaceWith(select);
  // Re-bind event listener
  if (fieldId === 'edificio') {
    select.addEventListener('change', onEdificioChange);
  } else if (fieldId === 'codigo') {
    select.addEventListener('change', onCodigoChange);
  }
}

// ===== Render Dimensions =====
function renderDimensions(cat) {
  dimensionsContainer.innerHTML = "";

  cat.dimensions.forEach((dim, idx) => {
    const card = document.createElement("div");
    card.className = "dimension-card";
    card.dataset.dimId = dim.id;

    const dimNum = idx + 1;
    const radioName = `dim_${dim.id}`;

    card.innerHTML = `
      <div class="dim-header">
        <span class="dim-name">D${dimNum}. ${dim.name}</span>
        <span class="dim-score-badge" id="badge_${dim.id}">—</span>
      </div>
      <div class="score-group">
        ${[1,2,3,4,5].map(v => `
          <div class="score-option">
            <input type="radio" name="${radioName}" id="${radioName}_${v}" value="${v}" />
            <label class="score-label" for="${radioName}_${v}">${v}</label>
          </div>
        `).join("")}
        <div class="score-option">
          <input type="radio" name="${radioName}" id="${radioName}_na" value="na" />
          <label class="score-label na-label" for="${radioName}_na">N/A</label>
        </div>
      </div>
      <div class="dim-photo-row" id="photoRow_${dim.id}">
        <button type="button" class="btn-photo" id="btnPhoto_${dim.id}" onclick="triggerPhoto('${dim.id}')">
          📷 Agregar foto
        </button>
        <span class="photo-count" id="photoCount_${dim.id}"></span>
      </div>
      <button type="button" class="dim-descriptors-toggle" onclick="toggleDescriptors(this)">
        <span class="arrow">▶</span> Ver descriptores
      </button>
      <div class="dim-descriptors">
        ${[5,4,3,2,1].map(v => `
          <div class="desc-item">
            <span class="desc-score s${v}">${v}</span>
            <span class="desc-text">${dim.descriptors[v]}</span>
          </div>
        `).join("")}
      </div>
    `;

    dimensionsContainer.appendChild(card);

    // Bind radio events
    card.querySelectorAll(`input[name="${radioName}"]`).forEach(radio => {
      radio.addEventListener("change", () => {
        const val = radio.value;
        const badge = document.getElementById(`badge_${dim.id}`);

        if (val === "na") {
          badge.textContent = "N/A";
          badge.style.background = "var(--bg-glass)";
          badge.style.color = "var(--text-muted)";
          card.className = "dimension-card scored";
        } else {
          const numVal = parseInt(val);
          const cls = getClassification(numVal);
          badge.textContent = `${cls.emoji} ${numVal}`;
          badge.style.background = cls.color + "22";
          badge.style.color = cls.color;
          card.className = numVal <= 2 ? "dimension-card scored warning" : "dimension-card scored";
        }

        updateResult();
      });
    });
  });
}

// ===== Photo Handling =====
function triggerPhoto(dimId) {
  const photos = currentPhotos[dimId] || [];
  if (photos.length >= MAX_PHOTOS_PER_DIM) {
    showToast(`⚠️ Máximo ${MAX_PHOTOS_PER_DIM} fotos por dimensión`);
    return;
  }
  activePhotoDimId = dimId;
  photoInput.value = "";
  photoInput.click();
}

function onPhotoSelected(e) {
  const file = e.target.files[0];
  if (!file || !activePhotoDimId) return;

  if (!file.type.startsWith("image/")) {
    showToast("⚠️ El archivo seleccionado no es una imagen");
    return;
  }

  compressImage(file, (base64) => {
    if (!currentPhotos[activePhotoDimId]) {
      currentPhotos[activePhotoDimId] = [];
    }
    currentPhotos[activePhotoDimId].push(base64);
    renderPhotoThumbs(activePhotoDimId);
    activePhotoDimId = null;
  });
}

function compressImage(file, callback) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      let w = img.width;
      let h = img.height;

      // Resize if larger than max
      if (w > PHOTO_MAX_SIZE || h > PHOTO_MAX_SIZE) {
        if (w > h) {
          h = Math.round(h * PHOTO_MAX_SIZE / w);
          w = PHOTO_MAX_SIZE;
        } else {
          w = Math.round(w * PHOTO_MAX_SIZE / h);
          h = PHOTO_MAX_SIZE;
        }
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);

      const base64 = canvas.toDataURL("image/jpeg", PHOTO_QUALITY);
      callback(base64);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function renderPhotoThumbs(dimId) {
  const row = document.getElementById(`photoRow_${dimId}`);
  const btn = document.getElementById(`btnPhoto_${dimId}`);
  const countEl = document.getElementById(`photoCount_${dimId}`);
  const photos = currentPhotos[dimId] || [];

  // Remove existing thumbs
  row.querySelectorAll(".photo-thumb-wrap").forEach(el => el.remove());

  // Add thumbs
  photos.forEach((base64, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "photo-thumb-wrap";
    wrap.innerHTML = `
      <img class="photo-thumb" src="${base64}" alt="Foto ${idx + 1}" onclick="openLightbox('${dimId}', ${idx})" />
      <button type="button" class="photo-remove" onclick="removePhoto('${dimId}', ${idx})">✕</button>
    `;
    row.insertBefore(wrap, btn);
  });

  // Update button state
  if (photos.length >= MAX_PHOTOS_PER_DIM) {
    btn.disabled = true;
    btn.textContent = "📷 Máximo alcanzado";
  } else {
    btn.disabled = false;
    btn.textContent = "📷 Agregar foto";
  }

  countEl.textContent = photos.length > 0 ? `${photos.length}/${MAX_PHOTOS_PER_DIM}` : "";
}

function removePhoto(dimId, idx) {
  if (currentPhotos[dimId]) {
    currentPhotos[dimId].splice(idx, 1);
    if (currentPhotos[dimId].length === 0) delete currentPhotos[dimId];
  }
  renderPhotoThumbs(dimId);
}

// ===== Lightbox =====
function openLightbox(dimId, idx) {
  const photos = currentPhotos[dimId];
  if (!photos || !photos[idx]) return;
  lightboxImg.src = photos[idx];
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
}

// Global for history lightbox
function openLightboxSrc(src) {
  lightboxImg.src = src;
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
}

// ===== Toggle Descriptors =====
function toggleDescriptors(btn) {
  btn.classList.toggle("open");
  const panel = btn.nextElementSibling;
  panel.classList.toggle("open");
  btn.querySelector(".arrow").textContent = panel.classList.contains("open") ? "▼" : "▶";
}

// ===== Update Result =====
function updateResult() {
  const catId = categoriaSelect.value;
  if (!catId) return;

  const cat = CATEGORIES.find(c => c.id === catId);
  let sum = 0, count = 0, hasWarning = false;

  cat.dimensions.forEach(dim => {
    const radio = document.querySelector(`input[name="dim_${dim.id}"]:checked`);
    if (radio && radio.value !== "na") {
      const v = parseInt(radio.value);
      sum += v;
      count++;
      if (v <= 2) hasWarning = true;
    }
  });

  accionesGroup.style.display = hasWarning ? "block" : "none";

  if (count === 0) {
    scoreValue.textContent = "—";
    scoreValue.style.color = "var(--text-muted)";
    resultBadge.textContent = "Sin evaluar";
    resultBadge.style.background = "var(--bg-glass)";
    resultBadge.style.color = "var(--text-muted)";
    resultAction.textContent = "";
    resultCard.style.borderColor = "var(--border)";
    return;
  }

  const avg = sum / count;
  const cls = getClassification(avg);

  scoreValue.textContent = avg.toFixed(2);
  scoreValue.style.color = cls.color;
  resultBadge.textContent = `${cls.emoji} ${cls.label}`;
  resultBadge.style.background = cls.color + "22";
  resultBadge.style.color = cls.color;
  resultAction.textContent = cls.action;
  resultCard.style.borderColor = cls.color + "66";
}

// ===== Submit =====
function onSubmit(e) {
  e.preventDefault();

  const catId = categoriaSelect.value;
  if (!catId) { showToast("⚠️ Seleccione una categoría"); return; }

  const nombre = document.getElementById("nombre").value.trim();
  const evaluador = document.getElementById("evaluador").value.trim();
  if (!nombre) { showToast("⚠️ Ingrese el nombre del espacio"); return; }
  if (!evaluador) { showToast("⚠️ Ingrese el nombre del evaluador"); return; }

  const cat = CATEGORIES.find(c => c.id === catId);
  const scores = {};
  let hasScore = false;

  cat.dimensions.forEach(dim => {
    const radio = document.querySelector(`input[name="dim_${dim.id}"]:checked`);
    if (radio) {
      scores[dim.id] = radio.value === "na" ? "N/A" : parseInt(radio.value);
      if (radio.value !== "na") hasScore = true;
    }
  });

  if (!hasScore) { showToast("⚠️ Evalúe al menos una dimensión (1-5)"); return; }

  const numScores = Object.values(scores).filter(v => typeof v === "number");
  const avg = numScores.reduce((a, b) => a + b, 0) / numScores.length;
  const cls = getClassification(avg);

  // Count total photos
  let totalPhotos = 0;
  Object.values(currentPhotos).forEach(arr => totalPhotos += arr.length);

  // Get values from either <select> or <input> elements
  const codigoEl = document.getElementById("codigo");
  const edificioEl = document.getElementById("edificio");
  const codigoVal = codigoEl ? codigoEl.value.trim() : '';
  const edificioVal = edificioEl ? edificioEl.value.trim() : '';

  const evaluation = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    codigo: codigoVal,
    nombre,
    categoria: catId,
    categoriaName: cat.name,
    categoriaIcon: cat.icon,
    edificio: edificioVal,
    piso: document.getElementById("piso").value.trim(),
    fecha: document.getElementById("fecha").value,
    hora: document.getElementById("hora").value,
    evaluador,
    cargo: document.getElementById("cargo").value.trim(),
    scores,
    photos: Object.keys(currentPhotos).length > 0 ? { ...currentPhotos } : {},
    photoCount: totalPhotos,
    promedio: parseFloat(avg.toFixed(2)),
    clasificacion: cls.label,
    color: cls.color,
    observaciones: document.getElementById("observaciones").value.trim(),
    acciones: document.getElementById("acciones").value.trim(),
    timestamp: new Date().toISOString()
  };

  // Try to save
  const data = getStoredData();
  data.unshift(evaluation);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    // Storage full - try without photos
    showToast("⚠️ Almacenamiento lleno. Guardando sin fotos...");
    evaluation.photos = {};
    evaluation.photoCount = 0;
    data[0] = evaluation;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err2) {
      showToast("❌ No se pudo guardar. Exporte y limpie el historial.");
      return;
    }
  }

  currentPhotos = {};
  updateBadgeCount();
  updateStorageIndicator();
  saveEvaluadorData();

  const photoMsg = totalPhotos > 0 ? ` (${totalPhotos} foto${totalPhotos > 1 ? 's' : ''})` : '';
  showToast(`✅ Guardado: ${nombre} — ${cls.emoji} ${cls.label} (${avg.toFixed(2)})${photoMsg}`);

  // Preserve evaluator data across resets
  const savedEvaluador = evaluadorInput.value;
  const savedCargo = cargoInput.value;

  form.reset();
  setDefaults();
  resetCascade();

  // Restore evaluator
  evaluadorInput.value = savedEvaluador;
  cargoInput.value = savedCargo;

  dimensionsSection.style.display = "none";
  resultSection.style.display = "none";
  obsSection.style.display = "none";
  formActions.style.display = "none";
  emptyState.style.display = "block";
}

function onReset() {
  currentPhotos = {};
  const savedEvaluador = evaluadorInput.value;
  const savedCargo = cargoInput.value;
  setTimeout(() => {
    setDefaults();
    resetCascade();
    // Restore evaluator (form.reset clears all inputs)
    evaluadorInput.value = savedEvaluador;
    cargoInput.value = savedCargo;
    dimensionsSection.style.display = "none";
    resultSection.style.display = "none";
    obsSection.style.display = "none";
    formActions.style.display = "none";
    emptyState.style.display = "block";
  }, 10);
}

// ===== Storage =====
function getStoredData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function updateBadgeCount() {
  const data = getStoredData();
  evalCount.textContent = data.length;
  evalCount.style.display = data.length > 0 ? "flex" : "none";
}

function updateStorageIndicator() {
  try {
    const used = new Blob([localStorage.getItem(STORAGE_KEY) || ""]).size;
    const total = 5 * 1024 * 1024; // Estimate 5MB
    const pct = Math.min(100, Math.round((used / total) * 100));

    storageFill.style.width = pct + "%";
    storageText.textContent = pct + "%";

    storageFill.classList.remove("warn", "danger");
    if (pct >= 90) {
      storageFill.classList.add("danger");
    } else if (pct >= STORAGE_WARN_PCT) {
      storageFill.classList.add("warn");
    }
  } catch { /* ignore */ }
}

// ===== Drawer =====
function openDrawer() {
  renderHistory();
  historyDrawer.classList.add("open");
  drawerOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeDrawer() {
  historyDrawer.classList.remove("open");
  drawerOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

function renderHistory() {
  const data = getStoredData();

  if (data.length === 0) {
    drawerStats.innerHTML = "No hay evaluaciones registradas.";
    historyList.innerHTML = `<div class="history-empty">📋 Las evaluaciones guardadas aparecerán aquí.</div>`;
    return;
  }

  const totalAvg = data.reduce((s, d) => s + d.promedio, 0) / data.length;
  const critical = data.filter(d => d.promedio < 2.5).length;
  const good = data.filter(d => d.promedio >= 3.5).length;
  const totalPhotos = data.reduce((s, d) => s + (d.photoCount || 0), 0);

  drawerStats.innerHTML = `
    <strong>${data.length}</strong> evaluaciones · 
    Promedio: <strong>${totalAvg.toFixed(2)}</strong> · 
    <span style="color:var(--red)">${critical} crít/def</span> · 
    <span style="color:var(--green)">${good} bueno/exc</span>
    ${totalPhotos > 0 ? ` · 📷 ${totalPhotos} fotos` : ''}
  `;

  historyList.innerHTML = data.map(ev => {
    const cls = getClassification(ev.promedio);
    const photoInfo = ev.photoCount ? `<div class="history-photos">📷 ${ev.photoCount} foto${ev.photoCount > 1 ? 's' : ''}</div>` : '';
    return `
      <div class="history-item" style="border-left-color: ${cls.color}">
        <div class="history-info">
          <div class="history-name">${ev.categoriaIcon || ""} ${ev.nombre}</div>
          <div class="history-meta">${ev.categoriaName || ev.categoria} · ${ev.edificio || "—"} · ${ev.fecha || "—"}</div>
          ${photoInfo}
        </div>
        <div class="history-score" style="color: ${cls.color}">${ev.promedio.toFixed(1)}</div>
        <button class="history-delete" onclick="deleteEvaluation('${ev.id}')" title="Eliminar">🗑️</button>
      </div>
    `;
  }).join("");
}

function deleteEvaluation(id) {
  if (!confirm("¿Eliminar esta evaluación?")) return;
  const data = getStoredData().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  updateBadgeCount();
  updateStorageIndicator();
  renderHistory();
  showToast("🗑️ Evaluación eliminada");
}

// ===== Export CSV (data only, no photos) =====
function exportCSV() {
  const data = getStoredData();
  if (data.length === 0) { showToast("No hay datos para exportar"); return; }

  const headers = ["ID","Código","Nombre","Categoría","Edificio","Piso","Fecha","Hora","Evaluador","Cargo","Promedio","Clasificación","Fotos","Observaciones","Acciones"];

  const allDimKeys = new Set();
  data.forEach(ev => Object.keys(ev.scores || {}).forEach(k => allDimKeys.add(k)));
  const dimKeys = [...allDimKeys];
  const fullHeaders = [...headers, ...dimKeys.map(k => `D_${k}`)];

  const rows = data.map(ev => {
    const base = [
      ev.id, ev.codigo, ev.nombre, ev.categoriaName || ev.categoria,
      ev.edificio, ev.piso, ev.fecha, ev.hora, ev.evaluador, ev.cargo,
      ev.promedio, ev.clasificacion, ev.photoCount || 0, ev.observaciones, ev.acciones
    ];
    const dims = dimKeys.map(k => ev.scores?.[k] ?? "");
    return [...base, ...dims];
  });

  const csvContent = [fullHeaders, ...rows]
    .map(row => row.map(cell => `"${String(cell || "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  downloadFile(
    "\uFEFF" + csvContent,
    `evaluaciones_uninorte_${new Date().toISOString().slice(0, 10)}.csv`,
    "text/csv;charset=utf-8;"
  );
  showToast(`📥 ${data.length} evaluaciones exportadas (CSV sin fotos)`);
}

// ===== Export JSON (with photos) =====
function exportJSON() {
  const data = getStoredData();
  if (data.length === 0) { showToast("No hay datos para exportar"); return; }

  const totalPhotos = data.reduce((s, d) => s + (d.photoCount || 0), 0);

  const exportObj = {
    version: "2.0",
    exportDate: new Date().toISOString(),
    institution: "Universidad del Norte — Barranquilla",
    totalEvaluations: data.length,
    totalPhotos,
    evaluations: data
  };

  const jsonStr = JSON.stringify(exportObj, null, 2);

  downloadFile(
    jsonStr,
    `evaluaciones_uninorte_${new Date().toISOString().slice(0, 10)}.json`,
    "application/json;charset=utf-8;"
  );
  showToast(`📦 ${data.length} evaluaciones exportadas con ${totalPhotos} fotos (JSON)`);
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ===== Import CSV or JSON =====
function importFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (ev) {
    const content = ev.target.result;

    if (file.name.endsWith(".json")) {
      importJSON(content);
    } else {
      importCSV(content);
    }
  };
  reader.readAsText(file, "UTF-8");
  e.target.value = "";
}

function importJSON(content) {
  try {
    const obj = JSON.parse(content);
    const evals = obj.evaluations || (Array.isArray(obj) ? obj : []);
    if (evals.length === 0) { showToast("⚠️ No se encontraron evaluaciones"); return; }

    const data = getStoredData();
    let imported = 0;

    evals.forEach((ev, i) => {
      ev.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5) + i;
      data.push(ev);
      imported++;
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      updateBadgeCount();
      updateStorageIndicator();
      renderHistory();
      const totalPhotos = evals.reduce((s, d) => s + (d.photoCount || 0), 0);
      showToast(`📤 ${imported} evaluaciones importadas${totalPhotos > 0 ? ` con ${totalPhotos} fotos` : ''}`);
    } catch (err) {
      showToast("⚠️ Almacenamiento insuficiente para importar con fotos");
    }
  } catch (err) {
    showToast("⚠️ Error al procesar el archivo JSON");
    console.error(err);
  }
}

function importCSV(content) {
  try {
    const lines = content.split("\n").filter(l => l.trim());
    if (lines.length < 2) { showToast("⚠️ Archivo CSV vacío"); return; }

    const headers = parseCSVLine(lines[0]);
    const data = getStoredData();
    let imported = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length < 11) continue;

      const row = {};
      headers.forEach((h, idx) => row[h] = values[idx] || "");

      const scores = {};
      headers.forEach((h, idx) => {
        if (h.startsWith("D_")) {
          const key = h.slice(2);
          const val = values[idx];
          scores[key] = val === "N/A" ? "N/A" : (isNaN(val) ? "" : parseFloat(val));
        }
      });

      const promedio = parseFloat(row["Promedio"]) || 0;
      const cls = getClassification(promedio);

      data.unshift({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5) + i,
        codigo: row["Código"] || row["Codigo"] || "",
        nombre: row["Nombre"] || `Importado ${i}`,
        categoria: (row["Categoría"] || row["Categoria"] || "").toLowerCase().replace(/\s/g, "_"),
        categoriaName: row["Categoría"] || row["Categoria"] || "",
        categoriaIcon: "",
        edificio: row["Edificio"] || "",
        piso: row["Piso"] || "",
        fecha: row["Fecha"] || "",
        hora: row["Hora"] || "",
        evaluador: row["Evaluador"] || "",
        cargo: row["Cargo"] || "",
        scores,
        photos: {},
        photoCount: 0,
        promedio,
        clasificacion: cls ? cls.label : "",
        color: cls ? cls.color : "",
        observaciones: row["Observaciones"] || "",
        acciones: row["Acciones"] || "",
        timestamp: new Date().toISOString()
      });
      imported++;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    updateBadgeCount();
    updateStorageIndicator();
    renderHistory();
    showToast(`📤 ${imported} evaluaciones importadas (CSV)`);
  } catch (err) {
    showToast("⚠️ Error al procesar el archivo CSV");
    console.error(err);
  }
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

// ===== Clear All =====
function clearAll() {
  const data = getStoredData();
  if (data.length === 0) { showToast("No hay datos para eliminar"); return; }
  if (!confirm(`¿Eliminar TODAS las ${data.length} evaluaciones (incluyendo fotos)? Esta acción no se puede deshacer.`)) return;

  localStorage.removeItem(STORAGE_KEY);
  updateBadgeCount();
  updateStorageIndicator();
  renderHistory();
  showToast("🗑️ Todos los datos eliminados");
}

// ===== Toast =====
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove("show"), 3500);
}
