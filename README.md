# EXPO 12H CONTROL CENTER

Sistema operativo para control logístico y coordinación de Expo 12 Horas Yahuarcocha.

Evento:

- EXPO 12 HORAS YAHUARCOCHA
- 24 de septiembre de 2026
- Parque Céntrica, Ibarra

## Cómo ejecutar

Es una aplicación estática con HTML5, CSS3 y JavaScript Vanilla. No requiere Node ni compilación.

Opción directa:

1. Abrir `index.html` en el navegador.

Opción recomendada para probar PWA y service worker:

1. Servir la carpeta con cualquier servidor estático.
2. Abrir la URL local generada.

Ejemplo con Python:

```bash
python -m http.server 8000
```

## Publicación en GitHub Pages

El proyecto queda listo para publicarse en:

https://appiba.github.io/check_list/

Configuración sugerida:

1. Subir los archivos a la rama principal del repositorio `appiba/check_list`.
2. En GitHub, abrir `Settings > Pages`.
3. Seleccionar `Deploy from a branch`.
4. Seleccionar la rama principal y la carpeta raíz `/`.
5. Guardar la configuración.

La app usa rutas relativas para que `index.html`, CSS, JavaScript, manifest y service worker funcionen en GitHub Pages.

## Estructura del proyecto

```text
index.html
manifest.json
service-worker.js
assets/
  icon.svg
css/
  styles.css
js/
  activations.js
  app.js
  broadcast.js
  checklist.js
  config.js
  dashboard.js
  data.js
  incidents.js
  map.js
  metrics.js
  storage.js
  team.js
  timeline.js
  utils.js
  vehicles.js
```

## Módulos

- Dashboard principal con avance general, tarjetas de control, actividad actual e incidencias abiertas.
- Checklist operativo con estados, responsable, hora, prioridad, observación, evidencia y filtros.
- Cronograma maestro con estados por actividad.
- Vehículos inscritos con 58 autos, buscador, filtros, parqueadero, puesto y estados rápidos.
- Activaciones Expo con 26 personas y controles individuales 0/8 a 8/8.
- Equipo operativo y staff S01-S10 con campos editables.
- Incidencias con reporte, prioridad, estado y hora de resolución.
- Circuito cerrado / transmisión como módulo de producción audiovisual.
- Mapa operativo preparado para incorporar el render 3D oficial.
- Configuración con reinicio confirmado de datos locales.

## Cómo modificar datos

Los datos base están en `js/data.js`:

- `CHECKLIST`: tareas iniciales por área.
- `TIMELINE`: cronograma maestro.
- `VEHICLES`: listado de autos inscritos.
- `ACTIVATIONS`: promotores / activaciones.
- `TEAM`: cadena de mando.
- `STAFF`: staff operativo S01-S10.
- `BROADCAST`: controles de transmisión.
- `MAP_ZONES`: zonas del mapa operativo.

El estado operativo se guarda en LocalStorage y se combina con los datos base cuando carga la app.

## Cómo resetear LocalStorage

Desde la app:

1. Abrir `CONFIGURACIÓN`.
2. Presionar `REINICIAR DATOS DEL EVENTO`.
3. Confirmar el reinicio.

Llave usada en LocalStorage:

```text
expo12h-control-center-v1
```

## Próxima integración

La arquitectura está preparada para reemplazar o complementar LocalStorage con Google Sheets + Google Apps Script en una siguiente fase, manteniendo separados datos, estado, filtros, métricas y renderizado.
