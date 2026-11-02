# routing Specification

## Purpose

Da a cada página de la aplicación una URL propia bajo la ruta base desde la que se sirve, y garantiza que esas URLs funcionen al abrirlas directamente, también en la demo de GitHub Pages.

## Requirements

### Requirement: URLs relativas a la ruta base
Las rutas de la aplicación SHALL resolverse relativas a la ruta base desde la que se sirve (`/` o `/beyblade-valencia/`). La página principal SHALL estar en la raíz de esa base y la de login en `login`.

#### Scenario: Login en la demo
- **WHEN** la aplicación se sirve bajo `/beyblade-valencia/` y el usuario sin sesión abre la raíz
- **THEN** la URL pasa a ser `/beyblade-valencia/login`

#### Scenario: Login servido en la raíz
- **WHEN** la aplicación se sirve desde `/` y el usuario sin sesión abre `/`
- **THEN** la URL pasa a ser `/login`

### Requirement: Acceso directo a una URL profunda en la demo
En la demo de GitHub Pages, abrir directamente una URL de la aplicación distinta de la raíz SHALL cargar la aplicación y mostrar la página correspondiente, también en una primera visita sin service worker.

#### Scenario: Primera visita a /login
- **GIVEN** el navegador no tiene ningún service worker registrado para la demo
- **WHEN** el usuario abre `/beyblade-valencia/login` directamente
- **THEN** la aplicación arranca y muestra el formulario de login

### Requirement: Ruta desconocida
Una URL de la aplicación que no corresponda a ninguna página SHALL redirigir a la página principal, que a su vez aplica la protección de páginas privadas.

#### Scenario: URL inexistente sin sesión
- **GIVEN** el usuario no tiene sesión
- **WHEN** abre `/no-existe`
- **THEN** termina en `/login`
