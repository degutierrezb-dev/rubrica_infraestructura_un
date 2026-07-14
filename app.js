// ============================================================
// app.js — UniNorte Evaluation Form v4 (Evaluator + Cascading Selects)
// ============================================================

const STORAGE_KEY = "uninorte_evaluaciones_v2";
const MAX_PHOTOS_PER_DIM = 2;
const PHOTO_MAX_SIZE = 800;   // Max dimension in pixels
const PHOTO_QUALITY = 0.5;     // JPEG quality (0-1)
const STORAGE_WARN_PCT = 80;   // Warn when storage is X% full

// Category ID for "Pasillos" (special case: available to all evaluators)
const PASILLOS_CAT_ID = "pasillo";

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
const evaluadorSelect = document.getElementById("evaluador");
const categoriaSelect = document.getElementById("categoria");
const edificioSelect = document.getElementById("edificio");
const codigoSelect = document.getElementById("codigo");
const pisoInput = document.getElementById("piso");
const nombreInput = document.getElementById("nombre");
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
const perceptionSection = document.getElementById("perceptionSection");
const perceptionText = document.getElementById("perceptionText");
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
// Track the currently filtered ESPACIOS for the selected evaluator
let evaluadorEspacios = [];
let editingEvaluationId = null;

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  populateEvaluadores();
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

// ===== Populate Evaluadores =====
function populateEvaluadores() {
  if (typeof EVALUADORES === 'undefined') return;
  EVALUADORES.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    evaluadorSelect.appendChild(opt);
  });
}

// ===== Populate Categories (filtered by evaluator) =====
function populateCategories(allowedCatIds) {
  categoriaSelect.innerHTML = '<option value="">— Seleccionar categoría —</option>';
  CATEGORIES.forEach(cat => {
    if (allowedCatIds && !allowedCatIds.has(cat.id)) return;
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
    if (ev) {
      evaluadorSelect.value = ev;
      // Trigger change to load their spaces
      onEvaluadorChange();
    }
    if (ca) cargoInput.value = ca;
  } catch (e) { /* ignore */ }
}

function saveEvaluadorData() {
  try {
    const ev = evaluadorSelect.value;
    const ca = cargoInput.value.trim();
    if (ev) appStorage.setItem("uninorte_evaluador", ev);
    if (ca) appStorage.setItem("uninorte_cargo", ca);
  } catch (e) { /* ignore */ }
}

// ===== Event Bindings =====
function bindEvents() {
  evaluadorSelect.addEventListener("change", onEvaluadorChange);
  categoriaSelect.addEventListener("change", onCategoryChange);
  edificioSelect.addEventListener("change", onEdificioChange);
  codigoSelect.addEventListener("change", onCodigoChange);
  form.addEventListener("submit", onSubmit);
  form.addEventListener("reset", onReset);
  document.getElementById("btnCancelEdit").addEventListener("click", cancelEditMode);

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

  // Perception emoji scale
  const PERCEPTION_LABELS = {
    "5": "🤩 ¡Impresionante! — Genera orgullo institucional",
    "4": "😊 Agradable — Buena impresión, se ve profesional",
    "3": "😐 Neutro — No genera sensación particular",
    "2": "😕 Poco atractivo — Da mala impresión",
    "1": "😬 Desfavorable — Afecta la imagen institucional"
  };
  document.querySelectorAll('input[name="percepcion"]').forEach(radio => {
    radio.addEventListener('change', () => {
      perceptionText.textContent = PERCEPTION_LABELS[radio.value] || '';
    });
  });
}

// ===== Evaluador Change (cascade step 0) =====
function onEvaluadorChange() {
  const selectedEvaluador = evaluadorSelect.value;
  currentPhotos = {};

  // Reset everything downstream
  resetCascade();
  dimensionsSection.style.display = "none";
  resultSection.style.display = "none";
  obsSection.style.display = "none";
  perceptionSection.style.display = "none";
  formActions.style.display = "none";
  emptyState.style.display = "block";

  if (!selectedEvaluador) {
    // No evaluator selected — show empty categories
    populateCategories(new Set());
    categoriaSelect.disabled = true;
    return;
  }

  // Filter ESPACIOS for this evaluator
  evaluadorEspacios = (typeof ESPACIOS !== 'undefined')
    ? ESPACIOS.filter(e => e.ev === selectedEvaluador)
    : [];

  // Get unique category IDs assigned to this evaluator
  const assignedCatIds = new Set(evaluadorEspacios.map(e => e.cat));

  // Always add "Pasillos / Escaleras / Áreas Comunes" for all evaluators
  assignedCatIds.add(PASILLOS_CAT_ID);

  // Populate categories with only the assigned ones
  populateCategories(assignedCatIds);
  categoriaSelect.disabled = false;
}

// ===== Category Change (cascade step 1) =====
function onCategoryChange() {
  const catId = categoriaSelect.value;
  currentPhotos = {}; // Reset photos when category changes

  // Reset cascaded fields
  resetCascade();

  if (!catId) {
    dimensionsSection.style.display = "none";
    resultSection.style.display = "none";
    obsSection.style.display = "none";
    perceptionSection.style.display = "none";
    formActions.style.display = "none";
    emptyState.style.display = "block";
    return;
  }

  const cat = CATEGORIES.find(c => c.id === catId);
  if (!cat) return;

  const selectedEvaluador = evaluadorSelect.value;

  // Special case: Pasillos — available to all evaluators
  if (catId === PASILLOS_CAT_ID) {
    currentCatHasEspacios = false;
    // Show edificio as a select with ALL unique edificios from the full ESPACIOS
    const allEdificios = (typeof ESPACIOS !== 'undefined')
      ? [...new Set(ESPACIOS.map(e => e.ed))].sort()
      : [];

    if (allEdificios.length > 0) {
      edificioSelect.innerHTML = '<option value="">— Seleccionar edificio —</option>';
      allEdificios.forEach(ed => {
        const opt = document.createElement("option");
        opt.value = ed;
        opt.textContent = ed;
        edificioSelect.appendChild(opt);
      });
      edificioSelect.disabled = false;
    }
    // Codigo, piso, nombre are free text for Pasillos
    swapToTextInput('codigoGroup', 'codigo', 'Ej: PAS-01');
  } else {
    // Normal category — filter by evaluator
    const espaciosCat = evaluadorEspacios.filter(e => e.cat === catId);
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
  }

  pisoInput.value = '';
  nombreInput.value = '';

  emptyState.style.display = "none";
  dimensionsSection.style.display = "block";
  resultSection.style.display = "block";
  obsSection.style.display = "block";
  perceptionSection.style.display = "block";
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

  // Special case: Pasillos — edificio is selectable but codigo/piso/nombre are free text
  if (catId === PASILLOS_CAT_ID) {
    // Codigo is already a text input for Pasillos, nothing to cascade
    return;
  }

  if (!edValue || !currentCatHasEspacios) {
    codigoSelect.innerHTML = '<option value="">— Seleccione edificio primero —</option>';
    codigoSelect.disabled = true;
    return;
  }

  // Filter ESPACIOS by evaluator + cat + edificio
  const matched = evaluadorEspacios.filter(e => e.cat === catId && e.ed === edValue);
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

  if (!currentCatHasEspacios) {
    return;
  }

  if (!codValue) {
    pisoInput.value = '';
    nombreInput.value = '';
    return;
  }

  const esp = evaluadorEspacios.find(e => e.cat === catId && e.cod === codValue);
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

function toggleDescriptors(btn) {
  const desc = btn.nextElementSibling;
  const arrow = btn.querySelector(".arrow");
  const isOpen = desc.style.display === "block";
  desc.style.display = isOpen ? "none" : "block";
  arrow.textContent = isOpen ? "▶" : "▼";
  btn.classList.toggle("open", !isOpen);
}

// ===== Photos =====
function triggerPhoto(dimId) {
  const photos = currentPhotos[dimId] || [];
  if (photos.length >= MAX_PHOTOS_PER_DIM) {
    showToast(`📷 Máximo ${MAX_PHOTOS_PER_DIM} fotos por dimensión`);
    return;
  }
  activePhotoDimId = dimId;
  photoInput.click();
}

function onPhotoSelected() {
  const file = photoInput.files[0];
  if (!file || !activePhotoDimId) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    compressImage(e.target.result, (compressed) => {
      if (!currentPhotos[activePhotoDimId]) currentPhotos[activePhotoDimId] = [];
      currentPhotos[activePhotoDimId].push(compressed);
      renderPhotoThumbs(activePhotoDimId);
      activePhotoDimId = null;
    });
  };
  reader.readAsDataURL(file);
  photoInput.value = '';
}

function compressImage(dataUrl, callback) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    let w = img.width, h = img.height;
    if (w > PHOTO_MAX_SIZE || h > PHOTO_MAX_SIZE) {
      if (w > h) { h = Math.round(h * PHOTO_MAX_SIZE / w); w = PHOTO_MAX_SIZE; }
      else { w = Math.round(w * PHOTO_MAX_SIZE / h); h = PHOTO_MAX_SIZE; }
    }
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    callback(canvas.toDataURL('image/jpeg', PHOTO_QUALITY));
  };
  img.src = dataUrl;
}

function renderPhotoThumbs(dimId) {
  const row = document.getElementById(`photoRow_${dimId}`);
  if (!row) return;

  // Remove existing thumbs
  row.querySelectorAll('.photo-thumb-wrap').forEach(el => el.remove());
  const countEl = document.getElementById(`photoCount_${dimId}`);

  const photos = currentPhotos[dimId] || [];
  countEl.textContent = photos.length > 0 ? `${photos.length}/${MAX_PHOTOS_PER_DIM}` : '';

  photos.forEach((src, idx) => {
    const thumb = document.createElement('div');
    thumb.className = 'photo-thumb-wrap';
    thumb.innerHTML = `
      <img class="photo-thumb" src="${src}" onclick="openLightbox('${src}')" />
      <button type="button" class="photo-remove" onclick="removePhoto('${dimId}', ${idx})">×</button>
    `;
    row.appendChild(thumb);
  });

  // Disable button if max reached
  const btn = document.getElementById(`btnPhoto_${dimId}`);
  if (btn) btn.disabled = photos.length >= MAX_PHOTOS_PER_DIM;
}

function removePhoto(dimId, idx) {
  if (currentPhotos[dimId]) {
    currentPhotos[dimId].splice(idx, 1);
    renderPhotoThumbs(dimId);
  }
}

function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.style.display = "flex";
}

function closeLightbox() {
  lightbox.style.display = "none";
  lightboxImg.src = "";
}

// ===== Result =====
function updateResult() {
  const catId = categoriaSelect.value;
  if (!catId) return;

  const cat = CATEGORIES.find(c => c.id === catId);
  if (!cat) return;

  let total = 0, count = 0;
  let hasLowScore = false;

  cat.dimensions.forEach(dim => {
    const radio = document.querySelector(`input[name="dim_${dim.id}"]:checked`);
    if (radio && radio.value !== "na") {
      const val = parseInt(radio.value);
      total += val;
      count++;
      if (val <= 2) hasLowScore = true;
    }
  });

  // Toggle action section
  accionesGroup.style.display = hasLowScore ? "block" : "none";

  if (count === 0) {
    scoreValue.textContent = "—";
    scoreValue.style.color = "var(--text-muted)";
    resultBadge.textContent = "Sin evaluar";
    resultBadge.style.background = "var(--bg-glass)";
    resultBadge.style.color = "var(--text-muted)";
    resultAction.textContent = "";
    resultCard.style.borderColor = "var(--border-color)";
    return;
  }

  const avg = total / count;
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
  const evaluador = evaluadorSelect.value;
  if (!nombre) { showToast("⚠️ Ingrese el nombre del espacio"); return; }
  if (!evaluador) { showToast("⚠️ Seleccione un evaluador/a"); return; }

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
    percepcion: (() => { const r = document.querySelector('input[name="percepcion"]:checked'); return r ? parseInt(r.value) : null; })(),
    mejoraria: document.getElementById("mejoraria") ? document.getElementById("mejoraria").value.trim() : '',
    timestamp: new Date().toISOString()
  };

  // Try to save
  const data = getStoredData();
  const isEdit = editingEvaluationId !== null;
  const evaluationId = isEdit ? editingEvaluationId : (Date.now().toString(36) + Math.random().toString(36).substr(2, 5));
  const originalTimestamp = isEdit ? (data.find(item => item.id === editingEvaluationId)?.timestamp || new Date().toISOString()) : new Date().toISOString();

  const evaluation = {
    id: evaluationId,
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
    percepcion: (() => { const r = document.querySelector('input[name="percepcion"]:checked'); return r ? parseInt(r.value) : null; })(),
    mejoraria: document.getElementById("mejoraria") ? document.getElementById("mejoraria").value.trim() : '',
    timestamp: originalTimestamp
  };

  if (isEdit) {
    const idx = data.findIndex(item => item.id === editingEvaluationId);
    if (idx !== -1) {
      data[idx] = evaluation;
    } else {
      data.unshift(evaluation);
    }
  } else {
    data.unshift(evaluation);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    // Storage full - try without photos
    showToast("⚠️ Almacenamiento lleno. Guardando sin fotos...");
    evaluation.photos = {};
    evaluation.photoCount = 0;
    if (isEdit) {
      const idx = data.findIndex(item => item.id === editingEvaluationId);
      if (idx !== -1) data[idx] = evaluation;
    } else {
      data[0] = evaluation;
    }
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
  const successMsg = isEdit ? `✅ Actualizado: ${nombre}` : `✅ Guardado: ${nombre} — ${cls.emoji} ${cls.label} (${avg.toFixed(2)})${photoMsg}`;
  showToast(successMsg);

  // Exit edit mode and reset form
  cancelEditMode();
}

function onReset() {
  if (editingEvaluationId !== null) {
    cancelEditMode();
  } else {
    currentPhotos = {};
    const savedEvaluador = evaluadorSelect.value;
    const savedCargo = cargoInput.value;
    setTimeout(() => {
      setDefaults();
      resetCascade();
      evaluadorSelect.value = savedEvaluador;
      cargoInput.value = savedCargo;
      onEvaluadorChange(); // Re-populate categories
      dimensionsSection.style.display = "none";
      resultSection.style.display = "none";
      obsSection.style.display = "none";
      perceptionSection.style.display = "none";
      perceptionText.textContent = '';
      formActions.style.display = "none";
      emptyState.style.display = "block";
    }, 10);
  }
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

    if (pct >= 90) {
      storageFill.style.background = "#ef4444";
      storageText.style.color = "#ef4444";
    } else if (pct >= STORAGE_WARN_PCT) {
      storageFill.style.background = "#f97316";
      storageText.style.color = "#f97316";
    } else {
      storageFill.style.background = "";
      storageText.style.color = "";
    }
  } catch (e) { /* ignore */ }
}

// ===== History Drawer =====
function openDrawer() {
  renderHistory();
  historyDrawer.classList.add("open");
  drawerOverlay.style.display = "block";
}

function closeDrawer() {
  historyDrawer.classList.remove("open");
  drawerOverlay.style.display = "none";
}

function renderHistory() {
  const data = getStoredData();
  historyList.innerHTML = "";

  if (data.length === 0) {
    drawerStats.innerHTML = '<span style="color:var(--text-muted)">Sin evaluaciones guardadas</span>';
    historyList.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">Aún no hay evaluaciones</p>';
    return;
  }

  // Stats
  const avgAll = data.reduce((a, b) => a + b.promedio, 0) / data.length;
  const critical = data.filter(d => d.promedio < 2.5).length;
  const good = data.filter(d => d.promedio >= 3.5).length;
  const totalPhotos = data.reduce((a, d) => a + (d.photoCount || 0), 0);
  drawerStats.innerHTML = `
    <span>📊 ${data.length} eval.</span>
    <span>📈 Prom: ${avgAll.toFixed(2)}</span>
    ${critical > 0 ? `<span style="color:#ef4444">🔴 ${critical} crít.</span>` : ''}
    ${good > 0 ? `<span style="color:#22c55e">🟢 ${good} buenos</span>` : ''}
    ${totalPhotos > 0 ? `<span>📷 ${totalPhotos}</span>` : ''}
  `;

  data.forEach(ev => {
    const cls = getClassification(ev.promedio);
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <div class="history-info">
        <div class="history-name">${ev.categoriaIcon || ''} ${ev.nombre || ev.codigo}</div>
        <div class="history-meta">
          ${ev.edificio ? ev.edificio + ' · ' : ''}${ev.categoriaName || ''} · ${ev.fecha}
          ${ev.photoCount ? ` · <span class="history-photos">📷 ${ev.photoCount}</span>` : ''}
        </div>
        <div class="history-meta" style="font-size:0.68rem;opacity:0.7;margin-top:1px;">
          👤 ${ev.evaluador || ''}
        </div>
      </div>
      <div class="history-score" style="background:${cls.color}22;color:${cls.color}">
        ${ev.promedio.toFixed(2)}
      </div>
      <button class="history-edit" onclick="editEvaluation('${ev.id}')" title="Editar">✏️</button>
      <button class="history-delete" onclick="deleteEvaluation('${ev.id}')">🗑️</button>
    `;
    historyList.appendChild(item);
  });
}

function deleteEvaluation(id) {
  if (!confirm("¿Eliminar esta evaluación?")) return;
  const data = getStoredData().filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  updateBadgeCount();
  updateStorageIndicator();
  renderHistory();
}

// ===== Export =====
function exportCSV() {
  const data = getStoredData();
  if (data.length === 0) { showToast("📋 No hay datos para exportar"); return; }

  // Gather all unique dimension keys
  const dimKeys = new Set();
  data.forEach(ev => Object.keys(ev.scores || {}).forEach(k => dimKeys.add(k)));
  const dimCols = [...dimKeys].sort();

  const headers = ["ID", "Código", "Nombre", "Categoría", "CategoríaNombre", "Edificio", "Piso",
    "Fecha", "Hora", "Evaluador", "Cargo", ...dimCols.map(d => `D_${d}`),
    "Promedio", "Clasificación", "Percepción", "Observaciones", "Acciones", "Mejoraría"];

  const rows = data.map(ev => {
    const base = [ev.id, ev.codigo, ev.nombre, ev.categoria, ev.categoriaName, ev.edificio, ev.piso,
      ev.fecha, ev.hora, ev.evaluador, ev.cargo];
    const dims = dimCols.map(d => ev.scores?.[d] ?? "");
    return [...base, ...dims, ev.promedio, ev.clasificacion, ev.percepcion || '',
      `"${(ev.observaciones || '').replace(/"/g, '""')}"`,
      `"${(ev.acciones || '').replace(/"/g, '""')}"`,
      `"${(ev.mejoraria || '').replace(/"/g, '""')}"`];
  });

  const csv = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  downloadFile(csv, `evaluaciones_uninorte_${new Date().toISOString().slice(0,10)}.csv`, "text/csv;charset=utf-8");
  showToast(`📥 CSV exportado (${data.length} evaluaciones, sin fotos)`);
}

function exportJSON() {
  const data = getStoredData();
  if (data.length === 0) { showToast("📋 No hay datos para exportar"); return; }

  const exportObj = {
    version: "3.0",
    exportDate: new Date().toISOString(),
    institution: "Universidad del Norte",
    totalEvaluations: data.length,
    totalPhotos: data.reduce((a, d) => a + (d.photoCount || 0), 0),
    evaluations: data
  };

  const json = JSON.stringify(exportObj, null, 2);
  downloadFile(json, `evaluaciones_uninorte_${new Date().toISOString().slice(0,10)}.json`, "application/json");
  showToast(`📥 JSON exportado (${data.length} evaluaciones, con fotos)`);
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===== Import =====
function importFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const content = ev.target.result;
    if (file.name.endsWith('.json')) {
      importJSON(content);
    } else if (file.name.endsWith('.csv')) {
      importCSV(content);
    } else {
      showToast("⚠️ Formato no soportado. Use .json o .csv");
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function importJSON(content) {
  try {
    const parsed = JSON.parse(content);
    const evals = parsed.evaluations || parsed;
    if (!Array.isArray(evals)) { showToast("⚠️ Formato JSON inválido"); return; }

    const existing = getStoredData();
    const existingIds = new Set(existing.map(e => e.id));

    let added = 0;
    evals.forEach(ev => {
      // Generate new ID to avoid conflicts
      ev.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5) + (added++);
      existing.push(ev);
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    updateBadgeCount();
    updateStorageIndicator();
    showToast(`📥 Importadas ${added} evaluaciones`);
  } catch (e) {
    showToast("❌ Error al importar JSON: " + e.message);
  }
}

function importCSV(content) {
  try {
    const lines = content.split('\n').filter(l => l.trim());
    if (lines.length < 2) { showToast("⚠️ CSV vacío"); return; }

    // Remove BOM if present
    let headerLine = lines[0];
    if (headerLine.charCodeAt(0) === 0xFEFF) headerLine = headerLine.substr(1);

    const headers = parseCSVLine(headerLine);
    const existing = getStoredData();
    let added = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length < 5) continue;

      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

      // Reconstruct evaluation object
      const scores = {};
      headers.filter(h => h.startsWith('D_')).forEach(h => {
        const dimId = h.replace('D_', '');
        const val = row[h];
        if (val === 'N/A') scores[dimId] = 'N/A';
        else if (val !== '' && !isNaN(val)) scores[dimId] = parseInt(val);
      });

      const evaluation = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5) + (added++),
        codigo: row['Código'] || '',
        nombre: row['Nombre'] || '',
        categoria: row['Categoría'] || '',
        categoriaName: row['CategoríaNombre'] || '',
        categoriaIcon: '',
        edificio: row['Edificio'] || '',
        piso: row['Piso'] || '',
        fecha: row['Fecha'] || '',
        hora: row['Hora'] || '',
        evaluador: row['Evaluador'] || '',
        cargo: row['Cargo'] || '',
        scores,
        photos: {},
        photoCount: 0,
        promedio: parseFloat(row['Promedio']) || 0,
        clasificacion: row['Clasificación'] || '',
        color: '',
        observaciones: row['Observaciones'] || '',
        acciones: row['Acciones'] || '',
        percepcion: row['Percepción'] ? parseInt(row['Percepción']) : null,
        mejoraria: row['Mejoraría'] || '',
        timestamp: new Date().toISOString()
      };

      // Re-derive color from classification
      const cls = getClassification(evaluation.promedio);
      evaluation.color = cls.color;
      evaluation.categoriaIcon = (CATEGORIES.find(c => c.id === evaluation.categoria) || {}).icon || '';

      existing.push(evaluation);
      added++;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    updateBadgeCount();
    updateStorageIndicator();
    showToast(`📥 Importadas ${added} evaluaciones desde CSV`);
  } catch (e) {
    showToast("❌ Error al importar CSV: " + e.message);
  }
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}

// ===== Clear All =====
function clearAll() {
  if (!confirm("⚠️ ¿Eliminar TODAS las evaluaciones guardadas? Esta acción no se puede deshacer.")) return;
  localStorage.removeItem(STORAGE_KEY);
  updateBadgeCount();
  updateStorageIndicator();
  closeDrawer();
  showToast("🗑️ Todas las evaluaciones fueron eliminadas");
}

// ===== Toast =====
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

// ===== Edit Mode =====
function editEvaluation(id) {
  const data = getStoredData();
  const ev = data.find(item => item.id === id);
  if (!ev) {
    showToast("❌ No se encontró la evaluación");
    return;
  }

  // Set edit state
  editingEvaluationId = id;

  // Show banner
  const editBanner = document.getElementById("editBanner");
  const editSpaceLabel = document.getElementById("editSpaceLabel");
  if (editBanner && editSpaceLabel) {
    editSpaceLabel.textContent = ev.nombre || ev.codigo || "Espacio sin nombre";
    editBanner.style.display = "flex";
  }

  // Change submit button text
  const btnSave = document.getElementById("btnSave");
  if (btnSave) {
    btnSave.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
      Actualizar Evaluación
    `;
  }

  // Close history drawer
  closeDrawer();

  // Load General Data
  evaluadorSelect.value = ev.evaluador || "";
  // Force evaluation list filter
  onEvaluadorChange();

  // Cargo
  cargoInput.value = ev.cargo || "";

  // Category
  categoriaSelect.value = ev.categoria || "";
  onCategoryChange();

  // Edificio & Código
  const edificioEl = document.getElementById("edificio");
  if (edificioEl) {
    edificioEl.value = ev.edificio || "";
    if (edificioEl.tagName === 'SELECT') {
      onEdificioChange();
    }
  }

  const codigoEl = document.getElementById("codigo");
  if (codigoEl) {
    codigoEl.value = ev.codigo || "";
    if (codigoEl.tagName === 'SELECT') {
      onCodigoChange();
    }
  }

  // Floor and Name
  pisoInput.value = ev.piso || "";
  nombreInput.value = ev.nombre || "";

  // Date and Time
  document.getElementById("fecha").value = ev.fecha || "";
  document.getElementById("hora").value = ev.hora || "";

  // Load scores for dimensions
  const cat = CATEGORIES.find(c => c.id === ev.categoria);
  if (cat) {
    cat.dimensions.forEach(dim => {
      const score = ev.scores?.[dim.id];
      if (score !== undefined) {
        const radioVal = (score === "N/A" || score === "na") ? "na" : score;
        const radio = document.querySelector(`input[name="dim_${dim.id}"][value="${radioVal}"]`);
        if (radio) {
          radio.checked = true;
          // Trigger change event manually to update badge colors
          radio.dispatchEvent(new Event('change'));
        }
      }
    });
  }

  // Observations & Actions & Suggestions
  document.getElementById("observaciones").value = ev.observaciones || "";
  if (document.getElementById("acciones")) {
    document.getElementById("acciones").value = ev.acciones || "";
  }
  if (document.getElementById("mejoraria")) {
    document.getElementById("mejoraria").value = ev.mejoraria || "";
  }

  // Perception radio button
  if (ev.percepcion !== undefined && ev.percepcion !== null) {
    const radio = document.querySelector(`input[name="percepcion"][value="${ev.percepcion}"]`);
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change'));
    }
  } else {
    document.querySelectorAll('input[name="percepcion"]').forEach(r => r.checked = false);
    document.getElementById("perceptionText").textContent = "";
  }

  // Photos
  currentPhotos = ev.photos ? JSON.parse(JSON.stringify(ev.photos)) : {};
  if (cat) {
    cat.dimensions.forEach(dim => {
      renderPhotoThumbs(dim.id);
    });
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEditMode() {
  editingEvaluationId = null;

  // Hide banner
  const editBanner = document.getElementById("editBanner");
  if (editBanner) editBanner.style.display = "none";

  // Revert submit button text
  const btnSave = document.getElementById("btnSave");
  if (btnSave) {
    btnSave.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
      Guardar Evaluación
    `;
  }

  // Reset form but preserve evaluator
  const savedEvaluador = evaluadorSelect.value;
  const savedCargo = cargoInput.value;

  form.reset();
  setDefaults();
  resetCascade();

  evaluadorSelect.value = savedEvaluador;
  cargoInput.value = savedCargo;
  onEvaluadorChange();

  dimensionsSection.style.display = "none";
  resultSection.style.display = "none";
  obsSection.style.display = "none";
  perceptionSection.style.display = "none";
  perceptionText.textContent = '';
  formActions.style.display = "none";
  emptyState.style.display = "block";
}
