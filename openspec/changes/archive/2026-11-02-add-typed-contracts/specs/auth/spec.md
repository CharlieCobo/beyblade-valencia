# Spec Delta

## ADDED Requirements

### Requirement: Sesión guardada inválida
Si la sesión guardada en el navegador no tiene la forma esperada (datos corruptos, editados a mano o de una versión anterior), la aplicación SHALL descartarla y tratar al usuario como sin sesión. MUST NOT fallar al arrancar.

#### Scenario: Sesión corrupta en el almacenamiento
- **GIVEN** el almacenamiento del navegador contiene una sesión con `exp` igual a `"mañana"`
- **WHEN** el usuario abre una página protegida
- **THEN** se le redirige al login
- **AND** la sesión guardada queda vacía

### Requirement: Token de login inválido
Si la API acepta las credenciales pero el `accessToken` recibido no tiene forma de JWT o su payload no incluye `sub`, `email`, `iat` y `exp` con el tipo esperado, la aplicación MUST NOT guardar ninguna sesión y SHALL mostrar el mensaje de error inesperado del login.

#### Scenario: Token sin payload legible
- **WHEN** la API responde al login con 200 y `{ "accessToken": "no-es-un-jwt" }`
- **THEN** se muestra "No se pudo iniciar sesión. Inténtalo de nuevo."
- **AND** el usuario sigue en la página de login sin sesión
