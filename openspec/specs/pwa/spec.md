# pwa Specification

## Purpose

Permite que la aplicación se instale como PWA, que su esqueleto se cargue sin conexión y que el usuario decida cuándo aplicar una versión nueva.

## Requirements

### Requirement: Web app manifest instalable
La aplicación SHALL publicar un web app manifest con nombre, nombre corto, `theme_color`, `background_color`, `display: standalone` e iconos de 192x192, 512x512 y maskable. El `scope` y la `start_url` SHALL coincidir con la ruta base desde la que se sirve la aplicación.

#### Scenario: Manifest en la demo de GitHub Pages
- **WHEN** se abre la aplicación servida bajo `/beyblade-valencia/`
- **THEN** el documento enlaza un manifest cuyo `scope` y `start_url` son `/beyblade-valencia/`
- **AND** el navegador considera la aplicación instalable

#### Scenario: Manifest servido en la raíz
- **WHEN** la aplicación se sirve desde `/`
- **THEN** el `scope` y la `start_url` del manifest son `/`

### Requirement: Esqueleto de la aplicación disponible sin conexión
Tras una primera visita con conexión, la aplicación SHALL arrancar y mostrar su interfaz sin conexión a partir de los recursos precacheados (HTML, JS, CSS e iconos).

#### Scenario: Recarga sin conexión
- **GIVEN** el usuario visitó la aplicación con conexión y el service worker está activo
- **WHEN** recarga la página sin conexión
- **THEN** la aplicación arranca y muestra su interfaz principal

### Requirement: Las respuestas de la API no se cachean
El service worker de la PWA MUST NOT servir desde caché ni almacenar respuestas de la API del backend; esas peticiones SHALL ir siempre a la red.

#### Scenario: Petición a la API con service worker activo
- **WHEN** la aplicación pide un recurso bajo la ruta base de la API
- **THEN** la petición va a la red y su respuesta no se guarda en ninguna caché del service worker

### Requirement: Aviso de nueva versión
Cuando haya una versión nueva lista, la aplicación SHALL mostrar un aviso con una acción para actualizar. La aplicación MUST NOT recargarse sin que el usuario lo pida.

#### Scenario: Nueva versión desplegada
- **GIVEN** el usuario tiene abierta una versión anterior
- **WHEN** el service worker detecta y deja lista una versión nueva
- **THEN** se muestra un aviso "Hay una nueva versión disponible" con un botón "Actualizar"
- **AND** la página no se recarga hasta que el usuario lo pulsa

#### Scenario: El usuario acepta la actualización
- **WHEN** el usuario pulsa "Actualizar" en el aviso
- **THEN** se activa la nueva versión y la página se recarga con ella

#### Scenario: El usuario descarta el aviso
- **WHEN** el usuario cierra el aviso sin actualizar
- **THEN** el aviso desaparece y la aplicación sigue con la versión actual

### Requirement: Sin service worker de PWA en desarrollo
El servidor de desarrollo MUST NOT registrar el service worker de la PWA.

#### Scenario: Arranque en desarrollo
- **WHEN** la aplicación se ejecuta con `npm run dev`
- **THEN** no hay ningún service worker de la PWA registrado para la página
