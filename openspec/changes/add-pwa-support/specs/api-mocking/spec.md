# Spec Delta

## Purpose

Simula la API del backend mientras no existe, en desarrollo, en la demo y en los tests, a partir de una única definición de mocks y sin ocupar el service worker de la aplicación.

## ADDED Requirements

### Requirement: Activación de los mocks por configuración
La API simulada SHALL activarse solo cuando la configuración del build lo indique (desarrollo y demo). Con los mocks desactivados, las peticiones SHALL ir a la red real.

#### Scenario: Build de demo
- **WHEN** la aplicación se construye en modo demo
- **THEN** las peticiones a la API se responden con los datos simulados

#### Scenario: Build de producción sin mocks
- **WHEN** la aplicación se construye sin activar los mocks
- **THEN** las peticiones a la API van a la red real
- **AND** el bundle generado no incluye los handlers ni los generadores de datos simulados

### Requirement: Mocks sin service worker
La simulación de la API en el navegador MUST NOT registrar ningún service worker, de modo que el service worker de la PWA sea el único de la aplicación.

#### Scenario: Demo con mocks y PWA
- **WHEN** se abre la demo con los mocks activos
- **THEN** el único service worker registrado es el de la PWA
- **AND** las peticiones a la API siguen respondiéndose con los datos simulados

### Requirement: Fuente única de mocks
Las respuestas simuladas en desarrollo, en la demo y en los tests SHALL salir de los mismos handlers.

#### Scenario: Mismo endpoint en demo y en tests
- **WHEN** un handler de una feature define la respuesta de un endpoint
- **THEN** la demo devuelve esa respuesta
- **AND** los tests reciben esa misma respuesta por defecto

### Requirement: Peticiones sin mock
Con los mocks activos, una petición a la API que no coincida con ningún handler SHALL enviarse a la red real.

#### Scenario: Endpoint aún no simulado
- **GIVEN** los mocks están activos
- **WHEN** la aplicación pide un endpoint que no tiene handler
- **THEN** la petición se envía a la red
