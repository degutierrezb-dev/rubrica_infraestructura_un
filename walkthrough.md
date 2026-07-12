# Walkthrough — Formulario de Evaluación v4 (Selector de Evaluador y Asignaciones)

## Cambios Realizados

### 1. Nuevo campo: Selector de Evaluador/a
- El campo **Evaluador** ahora es una lista desplegable (`<select>`) que contiene los nombres de los **39 evaluadores** oficiales de la institución.
- Estos nombres se extraen automáticamente de la columna "Evaluador/a" en la hoja **Asignaciones** del archivo `Detalle de espacios físicos para rúbrica v3.0.xlsx`.

### 2. Filtrado dinámico por asignaciones (Cascada v4)
- **Flujo de interacción:** El evaluador selecciona primero su nombre completo. Al hacerlo, el formulario filtra la lista de espacios y **solo muestra las categorías, edificios y códigos que tiene asignados**.
- **Ejemplo:** Si seleccionas a *Daniel Eduardo Gutiérrez Borrero*, la lista de categorías solo te mostrará "Baños" y "Auditorios/Salas de Eventos" (que son sus asignaciones en el Excel), además de la categoría universal "Pasillos/Escaleras/Áreas Comunes".

### 3. Caso Especial: Pasillos/Escaleras/Áreas Comunes
- Esta categoría está disponible para **todos** los evaluadores, incluso si no tienen asignaciones específicas de pasillos.
- **Edificio / Bloque:** Se selecciona de una lista desplegable que contiene **todos** los edificios únicos del campus (30 en total).
- **Código, Piso y Nombre:** Se digitan de forma libre (el campo "Código" se transforma automáticamente en un campo de texto). Se aseguró que al digitar el código no se limpien el piso o nombre ingresados manualmente por el usuario.

### 4. Soporte para Auditorios
- Se mapeó correctamente la nueva categoría **Auditorios/Salas de Eventos** desde el Excel al id interno `auditorio` de la app. Los espacios (como el *Auditorio Marvel Moreno* o el *Salón Gabriel García Márquez*) ya se cargan y asocian dinámicamente al evaluador correspondiente.

### 5. Persistencia del Evaluador Seleccionado
- Se mantiene el comportamiento donde el evaluador seleccionado y su cargo se guardan en el navegador (`localStorage`) y no se borran al limpiar el formulario, facilitando múltiples evaluaciones seguidas.

### 6. Optimización Móvil y Corrección de Bugs Multiplataforma (iOS y Android)
- **Prevención de Zoom Automático (iOS):** Se configuró el tamaño de fuente de todos los inputs, selects y textareas a `16px` para dispositivos móviles (pantallas ≤ 500px). Esto evita que Safari en iOS haga zoom automático y desplace la interfaz cuando el usuario enfoca un campo de entrada.
- **Contraste de Encabezado en Modo Claro:** Se corrigió un error visual en el modo claro donde el encabezado (`.app-header`) mantenía un color de fondo oscuro de forma fija, dejando el título y la descripción con texto oscuro sobre fondo oscuro (ilegibles). Ahora se adapta correctamente a cada tema.
- **Optimización de Fotos y Espacio Offline:** Se ajustó la resolución máxima de compresión de las imágenes de `1024px` a `800px` (`PHOTO_MAX_SIZE`), lo cual reduce el peso de cada foto en un ~30-40% sin perder calidad de lectura, permitiendo almacenar casi el doble de evaluaciones en el almacenamiento local del dispositivo.
- **Corrección de Diseño en Historial:** Se alineó el marcado HTML dinámico del historial con las clases definidas en `styles.css` (`history-info`, `history-name`, `history-meta`, `history-score`). Esto corrige el error de visualización donde las columnas se apretaban en una sola línea y se solapaban en el cajón lateral.

---

## Archivos Modificados

| Archivo | Cambio |
|---|---|
| [data.js](file:///C:/Users/degutierrez/.gemini/antigravity/scratch/rubrica-uninorte-v2/data.js) | +493 registros `ESPACIOS` (con el campo `ev`), constante `EVALUADORES` con los 39 nombres ordenados. |
| [app.js](file:///C:/Users/degutierrez/.gemini/antigravity/scratch/rubrica-uninorte-v2/app.js) | Lógica de filtrado dinámico por evaluador, población de selectores, manejo especial de Pasillos (edificio de lista total, código libre sin limpiar piso/nombre). |
| [styles.css](file:///C:/Users/degutierrez/.gemini/antigravity/scratch/rubrica-uninorte-v2/styles.css) | Corrección de contraste en modo claro para el header, prevención de zoom automático en inputs de iOS, y definición de estilos de miniatura de fotos. |
| [index.html](file:///C:/Users/degutierrez/.gemini/antigravity/scratch/rubrica-uninorte-v2/index.html) | HTML del formulario actualizado con el selector de evaluador en la parte superior y categoría deshabilitada inicialmente. |

## Archivos Auxiliares (no se suben a GitHub)

| Archivo | Propósito |
|---|---|
| `gen_espacios.py` | Genera `espacios_generated.js` leyendo la hoja **Asignaciones** del Excel v3.0, mapeando Auditorios y extrayendo evaluadores únicos. |
| `build_data.py` | Inserta los datos generados al principio de `data.js`. |
| `compilar.py` | Compila todos los cambios dentro del único archivo auto-contenido `index.html`. |

---

## Cómo Publicar en GitHub

Abre Git Bash o tu consola de comandos en la carpeta del proyecto y ejecuta:

```bash
git add index.html data.js app.js gen_espacios.py
git commit -m "v4: Selector de evaluadores con filtrado dinámico de asignaciones"
git push origin main
```

Luego recarga la página en tu celular para ver los cambios:  
[https://degutierrezb-dev.github.io/rubrica_infraestructura_un/](https://degutierrezb-dev.github.io/rubrica_infraestructura_un/)
