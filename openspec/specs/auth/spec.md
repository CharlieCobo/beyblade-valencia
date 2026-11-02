# auth Specification

## Purpose

Permite que un usuario se identifique con su correo y su contraseña, mantiene su sesión en el cliente y restringe las páginas privadas a quien tiene una sesión válida.

## Requirements

### Requirement: Formulario de inicio de sesión
La página de login SHALL mostrar un formulario con un campo de correo, un campo de contraseña y un botón "Iniciar sesión". El formulario MUST NOT enviarse si el correo está vacío o no tiene formato de correo, o si la contraseña está vacía, y SHALL mostrar bajo cada campo inválido el mensaje correspondiente: "Introduce tu correo", "Introduce un correo válido" o "Introduce tu contraseña". El correo SHALL enviarse sin espacios al principio ni al final; la contraseña SHALL enviarse tal cual.

#### Scenario: Campos vacíos
- **GIVEN** el usuario está en la página de login
- **WHEN** pulsa "Iniciar sesión" con los campos vacíos
- **THEN** no se envía ninguna petición a la API
- **AND** bajo el correo se muestra "Introduce tu correo"
- **AND** bajo la contraseña se muestra "Introduce tu contraseña"
- **AND** el foco queda en el campo de correo

#### Scenario: Correo con formato inválido
- **WHEN** el usuario escribe `test-mail.com` como correo y pulsa "Iniciar sesión"
- **THEN** no se envía ninguna petición a la API
- **AND** bajo el correo se muestra "Introduce un correo válido"

#### Scenario: Correo con espacios alrededor
- **WHEN** el usuario escribe ` test@mail.com ` como correo, `Test1234!` como contraseña y pulsa "Iniciar sesión"
- **THEN** se envía la petición de login con el correo `test@mail.com`, sin espacios

### Requirement: Inicio de sesión correcto
Cuando la API acepte las credenciales, la aplicación SHALL guardar la sesión (token, correo y expiración) y llevar al usuario a la página que intentaba abrir o, si no había ninguna, a la página principal.

#### Scenario: Credenciales del usuario de prueba
- **GIVEN** el usuario está en `/login` sin venir de ninguna otra página
- **WHEN** introduce `test@mail.com` y `Test1234!` y pulsa "Iniciar sesión"
- **THEN** se navega a `/`
- **AND** la sesión contiene el token recibido y el correo `test@mail.com`

#### Scenario: Vuelta a la página solicitada
- **GIVEN** el usuario sin sesión intentó abrir una página protegida y fue redirigido al login
- **WHEN** inicia sesión correctamente
- **THEN** se navega a la página que intentaba abrir

### Requirement: Credenciales incorrectas
Si la API rechaza las credenciales con un 401, el formulario SHALL mostrar el mensaje "Correo o contraseña incorrectos" sin indicar cuál de los dos falla y MUST NOT guardar ninguna sesión.

#### Scenario: Contraseña equivocada
- **WHEN** el usuario envía `test@mail.com` con una contraseña distinta de `Test1234!`
- **THEN** se muestra "Correo o contraseña incorrectos"
- **AND** el usuario sigue en la página de login sin sesión

### Requirement: Error inesperado al iniciar sesión
Si la petición de login falla por otro motivo (error del servidor o de red), el formulario SHALL mostrar un mensaje genérico que invite a intentarlo de nuevo, distinto del de credenciales incorrectas.

#### Scenario: Error del servidor
- **WHEN** la API responde al login con un 500
- **THEN** se muestra "No se pudo iniciar sesión. Inténtalo de nuevo."

### Requirement: Estado de envío
Mientras la petición de login está en curso, el botón SHALL indicar que se está enviando y MUST NOT permitir un segundo envío.

#### Scenario: Doble clic
- **WHEN** el usuario envía el formulario y la respuesta aún no ha llegado
- **THEN** el botón está deshabilitado y muestra "Iniciando sesión…"

### Requirement: Inicio de sesión sin conexión
Si el dispositivo no tiene conexión al enviar el formulario, la aplicación SHALL mostrar el aviso "Sin conexión. Revisa tu conexión e inténtalo de nuevo." y MUST NOT enviar la petición, ni en ese momento ni automáticamente al recuperar la conexión.

#### Scenario: Envío sin conexión
- **GIVEN** el dispositivo no tiene conexión
- **WHEN** el usuario envía credenciales válidas
- **THEN** se muestra el aviso de sin conexión
- **AND** no se envía ninguna petición de login

#### Scenario: Vuelve la conexión
- **GIVEN** se mostró el aviso de sin conexión
- **WHEN** el dispositivo recupera la conexión
- **THEN** no se inicia sesión hasta que el usuario vuelve a enviar el formulario

### Requirement: Sesión persistente
La sesión SHALL conservarse entre recargas y cierres de la aplicación en el mismo navegador hasta su expiración.

#### Scenario: Recarga con sesión
- **GIVEN** el usuario ha iniciado sesión
- **WHEN** recarga la página
- **THEN** sigue con sesión y puede ver las páginas protegidas sin volver a identificarse

### Requirement: Expiración de la sesión
La aplicación SHALL considerar expirada una sesión cuyo instante de expiración, tomado del token, ya ha pasado. La firma del token MUST NOT verificarse en el cliente.

#### Scenario: Token caducado al abrir la aplicación
- **GIVEN** hay una sesión guardada cuya expiración ya ha pasado
- **WHEN** el usuario abre una página protegida
- **THEN** la sesión se considera expirada y se le redirige al login

### Requirement: Protección de páginas privadas
Las páginas marcadas como privadas SHALL mostrarse solo con una sesión no expirada. Sin ella, la aplicación SHALL redirigir a `/login` sustituyendo la entrada del historial, de modo que "atrás" no vuelva a la página protegida.

#### Scenario: Acceso sin sesión
- **GIVEN** el usuario no tiene sesión
- **WHEN** abre `/`
- **THEN** se muestra la página de login en `/login`
- **AND** la lista de beyblades no se muestra ni se pide a la API

#### Scenario: Acceso con sesión
- **GIVEN** el usuario tiene una sesión no expirada
- **WHEN** abre `/`
- **THEN** se muestra la lista de beyblades

### Requirement: Login con sesión activa
Si un usuario con una sesión no expirada abre `/login`, la aplicación SHALL redirigirlo a la página principal.

#### Scenario: Abrir el login ya identificado
- **GIVEN** el usuario tiene una sesión no expirada
- **WHEN** abre `/login`
- **THEN** se navega a `/`

### Requirement: Endpoint simulado de login
Con los mocks activos, `POST /api/auth/login` SHALL responder 200 con `{ accessToken }` para `test@mail.com` / `Test1234!`, y 401 para cualquier otra combinación. El token SHALL tener la forma `header.payload.firma` con un payload en base64url que incluya `sub`, `email`, `iat` y `exp` (en segundos), con una validez de una hora.

#### Scenario: Login simulado correcto
- **WHEN** se hace `POST /api/auth/login` con `{ "email": "test@mail.com", "password": "Test1234!" }`
- **THEN** la respuesta es 200 con un `accessToken` cuyo payload decodificado tiene `email` igual a `test@mail.com` y `exp` igual a `iat + 3600`

#### Scenario: Login simulado incorrecto
- **WHEN** se hace `POST /api/auth/login` con cualquier otra combinación
- **THEN** la respuesta es 401

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
