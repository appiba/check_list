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
  expo12h-logo-alt.png
  expo12h-logo-primary.png
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
  sync.js
  team.js
  timeline.js
  utils.js
  vehicles.js
google-apps-script/
  Code.gs
  appsscript.json
```

## Módulos

- Dashboard principal con avance general, tarjetas de control, actividad actual e incidencias abiertas.
- Identidad visual EXPO 12H aplicada en header y dashboard.
- Checklist operativo con estados, responsable, hora, prioridad, observación, evidencia y filtros.
- Cronograma maestro con estados por actividad.
- Vehículos inscritos con 58 autos, buscador, filtros, parqueadero, puesto y estados rápidos.
- Activaciones Expo con 26 personas y controles individuales 0/8 a 8/8.
- Equipo operativo y staff S01-S10 con campos editables.
- Incidencias con reporte, prioridad, estado y hora de resolución.
- Circuito cerrado / transmisión como módulo de producción audiovisual.
- Mapa operativo preparado para incorporar el render 3D oficial.
- Configuración con reinicio confirmado de datos locales.
- Sincronización con Google Sheets mediante Google Apps Script Web App.

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

## Google Sheets + Apps Script

La app incluye integración lista para Google Sheets. El backend está en `google-apps-script/Code.gs`.

Hoja configurada:

```text
1xNuN2tUVGF55T_fiHjZknBhg6pkYxj8Gc-TaJ-jPzps
```

Web App configurado:

```text
https://script.google.com/macros/s/AKfycbxdWHR_Am0abA0Sa55dNNVmwF0LJ8bsO7TGcnIpYfovvwRLXx0UWrFJMycNfAfKJXi8/exec
```

Activación:

1. Abrir el proyecto en Apps Script.
2. Pegar el contenido de `google-apps-script/Code.gs` en `Código.gs`.
3. En configuración del proyecto, activar el manifiesto y usar `google-apps-script/appsscript.json` si se desea copiar la configuración.
4. Ejecutar `setupExpo12hControlCenter`.
5. Autorizar permisos de Google cuando Apps Script lo pida.
6. Desplegar como Web App.
7. Usar:
   - Ejecutar como: usuario que despliega.
   - Acceso: cualquier usuario con el enlace.
8. Copiar la URL `/exec` del Web App si cambia el despliegue.
9. En la app, abrir `CONFIGURACIÓN`, verificar la URL, activar sincronización automática y presionar `Probar conexión`.
10. Presionar `Subir estado local` para poblar las pestañas de Google Sheets.

La escritura desde GitHub Pages usa POST hacia Apps Script y la lectura usa JSONP para evitar problemas de CORS.

Pestañas generadas:

- `DASHBOARD`
- `CHECKLIST`
- `TIMELINE`
- `VEHICLES`
- `ACTIVATIONS`
- `TEAM`
- `STAFF`
- `INCIDENTS`
- `BROADCAST`
- `MAP`

## Próxima integración

La arquitectura ya sincroniza con Google Sheets vía Apps Script. La siguiente mejora natural es agregar autenticación con token operativo o una interfaz de administración para bloquear cambios externos al Web App.
