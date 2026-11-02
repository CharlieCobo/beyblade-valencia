# theming Specification

## Purpose

Define el tema visual con el que se muestra la aplicación y garantiza que el usuario no vea un tema distinto mientras la aplicación carga.

## Requirements

### Requirement: Tema oscuro por defecto
La aplicación SHALL mostrarse con el tema oscuro sea cual sea la preferencia de color del sistema o del navegador.

#### Scenario: Sistema en modo claro
- **GIVEN** el sistema operativo del usuario está en modo claro
- **WHEN** abre la aplicación
- **THEN** la aplicación se muestra con fondo oscuro y texto claro

#### Scenario: Sistema en modo oscuro
- **GIVEN** el sistema operativo del usuario está en modo oscuro
- **WHEN** abre la aplicación
- **THEN** la aplicación se muestra con fondo oscuro y texto claro

### Requirement: Sin destello de otro tema al cargar
Desde el primer pintado, y también en la pantalla de arranque de la aplicación instalada, el fondo SHALL ser el del tema oscuro. La aplicación MUST NOT mostrar un fondo claro mientras carga.

#### Scenario: Primera carga en el navegador
- **WHEN** el usuario abre la aplicación y el JavaScript aún no se ha ejecutado
- **THEN** el fondo de la página ya es oscuro

#### Scenario: Apertura de la aplicación instalada
- **GIVEN** la aplicación está instalada como PWA
- **WHEN** el usuario la abre
- **THEN** la pantalla de arranque usa el color de fondo del tema oscuro

### Requirement: Controles nativos acordes al tema
Los controles nativos del navegador (barras de desplazamiento, campos de formulario, autocompletado) SHALL mostrarse en su variante oscura.

#### Scenario: Campo de formulario
- **WHEN** el usuario ve un campo de texto de la aplicación
- **THEN** el navegador lo pinta con su esquema de color oscuro
