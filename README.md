# Inducción al Voluntariado · Fundación Felipe Motta

Sitio estático de una sola página con la inducción en línea para los colaboradores
de Felipe Motta S.A. que se suman al programa de voluntariado. Son 7 pasos: el
voluntario avanza uno por uno y al final confirma con un formulario (nombre, correo,
departamento y tres casillas).

Es HTML, CSS y JavaScript sin dependencias: no hay que compilar ni instalar nada.

## Archivos

```
index.html    todo el contenido de los 7 pasos
styles.css    estilos
app.js        navegación por pasos y envío del formulario
img/          fotos y logos optimizados
docs/         los 3 PDF oficiales
```

## Ver el sitio en tu computadora

Abre una terminal dentro de esta carpeta `site` y ejecuta:

```
python -m http.server 8080
```

Luego entra a <http://localhost:8080> en el navegador. Para cerrarlo, Ctrl + C.

## Publicarlo

Sirve cualquier hosting de archivos estáticos. Lo más rápido:

- **Netlify:** entra a [app.netlify.com/drop](https://app.netlify.com/drop) y arrastra
  la carpeta `site` completa a la página. En segundos te da una URL para compartir
  por WhatsApp.
- **Cloudflare Pages:** en el panel, *Workers & Pages → Create → Pages → Upload assets*
  y arrastra la misma carpeta `site`.

Después se le puede apuntar un subdominio de la fundación.

## Dónde se registran las confirmaciones

El formulario del último paso envía los datos a un Google Apps Script que escribe una
fila en un Google Sheet y manda un correo de aviso. La URL de ese script se pega en la
primera línea de configuración de `app.js`:

```js
const ENDPOINT = "";
```

Mientras esté vacía, el formulario funciona en modo demostración: muestra la pantalla
de confirmación pero no guarda nada. Las instrucciones para crear la hoja y el script
están en `apps-script/SETUP.md`.

## Imágenes

Las fotos de `img/` se generan desde `assets/img` con `python tools/optimize_images.py`
(máximo 1600 px, menos de 350 KB cada una). No edites `img/` a mano: vuelve a correr
ese script.
