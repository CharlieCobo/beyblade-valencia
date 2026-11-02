# Spec Delta

## MODIFIED Requirements

### Requirement: Las respuestas de la API no se cachean
El service worker de la PWA MUST NOT servir desde caché ni almacenar las peticiones a los servicios del backend (autenticación y base de datos de Firebase); esas peticiones SHALL ir siempre a la red.

#### Scenario: Petición a la API con service worker activo
- **WHEN** la aplicación hace una petición a los servicios de Firebase
- **THEN** la petición va a la red y su respuesta no se guarda en ninguna caché del service worker
