# Spec Delta

## ADDED Requirements

### Requirement: Comprobación de la sesión al arrancar
Mientras la aplicación aún no sabe si hay una sesión activa, las páginas privadas y el login SHALL mostrar el indicador "Comprobando sesión…" en lugar de su contenido, y MUST NOT redirigir hasta conocer el resultado.

#### Scenario: Recarga de una página privada con sesión
- **GIVEN** el usuario tiene sesión
- **WHEN** recarga `/` y la sesión aún se está comprobando
- **THEN** se muestra "Comprobando sesión…"
- **AND** no se navega a `/login`
- **AND** al confirmarse la sesión se muestra la lista de beyblades

#### Scenario: Comprobación sin sesión
- **GIVEN** el usuario no tiene sesión
- **WHEN** abre `/` y termina la comprobación
- **THEN** se navega a `/login`

### Requirement: Cierre de sesión
Las páginas privadas SHALL ofrecer un botón "Cerrar sesión". Al pulsarlo, la aplicación SHALL cerrar la sesión y llevar al usuario a `/login`, sustituyendo la entrada del historial.

#### Scenario: El usuario cierra sesión
- **GIVEN** el usuario tiene sesión y está en `/`
- **WHEN** pulsa "Cerrar sesión"
- **THEN** se navega a `/login`
- **AND** al recargar sigue sin sesión

## MODIFIED Requirements

### Requirement: Formulario de inicio de sesión
La página de login SHALL mostrar un formulario con un campo de correo, un campo de contraseña y un botón "Iniciar sesión". El formulario MUST NOT enviarse si el correo está vacío o no tiene formato de correo, o si la contraseña está vacía, y SHALL mostrar bajo cada campo inválido el mensaje correspondiente: "Introduce tu correo", "Introduce un correo válido" o "Introduce tu contraseña". El correo SHALL enviarse sin espacios al principio ni al final; la contraseña SHALL enviarse tal cual.

#### Scenario: Campos vacíos
- **GIVEN** el usuario está en la página de login
- **WHEN** pulsa "Iniciar sesión" con los campos vacíos
- **THEN** no se intenta iniciar sesión
- **AND** bajo el correo se muestra "Introduce tu correo"
- **AND** bajo la contraseña se muestra "Introduce tu contraseña"
- **AND** el foco queda en el campo de correo

#### Scenario: Correo con formato inválido
- **WHEN** el usuario escribe `test-mail.com` como correo y pulsa "Iniciar sesión"
- **THEN** no se intenta iniciar sesión
- **AND** bajo el correo se muestra "Introduce un correo válido"

#### Scenario: Correo con espacios alrededor
- **WHEN** el usuario escribe ` test@mail.com ` como correo, `Test1234!` como contraseña y pulsa "Iniciar sesión"
- **THEN** se intenta iniciar sesión con el correo `test@mail.com`, sin espacios

### Requirement: Inicio de sesión correcto
Cuando el servicio de autenticación acepte las credenciales y la cuenta esté habilitada, la aplicación SHALL iniciar la sesión (con el correo y el rol del usuario) y llevar al usuario a la página que intentaba abrir o, si no había ninguna, a la página principal.

#### Scenario: Credenciales del usuario de prueba
- **GIVEN** el usuario está en `/login` sin venir de ninguna otra página
- **AND** existe una cuenta habilitada con correo `test@mail.com` y contraseña `Test1234!`
- **WHEN** introduce `test@mail.com` y `Test1234!` y pulsa "Iniciar sesión"
- **THEN** se navega a `/`
- **AND** la sesión contiene el correo `test@mail.com`

#### Scenario: Vuelta a la página solicitada
- **GIVEN** el usuario sin sesión intentó abrir una página protegida y fue redirigido al login
- **WHEN** inicia sesión correctamente
- **THEN** se navega a la página que intentaba abrir

### Requirement: Credenciales incorrectas
Si el servicio de autenticación rechaza las credenciales (correo inexistente o contraseña equivocada), el formulario SHALL mostrar el mensaje "Correo o contraseña incorrectos" sin indicar cuál de los dos falla y MUST NOT iniciar ninguna sesión.

#### Scenario: Contraseña equivocada
- **WHEN** el usuario envía el correo de una cuenta existente con una contraseña equivocada
- **THEN** se muestra "Correo o contraseña incorrectos"
- **AND** el usuario sigue en la página de login sin sesión

#### Scenario: Correo inexistente
- **WHEN** el usuario envía un correo que no corresponde a ninguna cuenta
- **THEN** se muestra "Correo o contraseña incorrectos"

### Requirement: Error inesperado al iniciar sesión
Si el inicio de sesión falla por otro motivo (error del servicio, de red o demasiados intentos), el formulario SHALL mostrar un mensaje genérico que invite a intentarlo de nuevo, distinto del de credenciales incorrectas.

#### Scenario: Error del servidor
- **WHEN** el servicio de autenticación falla con un error distinto de credenciales incorrectas
- **THEN** se muestra "No se pudo iniciar sesión. Inténtalo de nuevo."

### Requirement: Sesión persistente
La sesión SHALL conservarse entre recargas y cierres de la aplicación en el mismo navegador hasta que el usuario cierre sesión o su cuenta deje de estar habilitada.

#### Scenario: Recarga con sesión
- **GIVEN** el usuario ha iniciado sesión
- **WHEN** recarga la página
- **THEN** sigue con sesión y puede ver las páginas protegidas sin volver a identificarse

#### Scenario: Sesión tras cerrar la aplicación
- **GIVEN** el usuario ha iniciado sesión y no ha cerrado sesión
- **WHEN** cierra la aplicación y la vuelve a abrir días después
- **THEN** sigue con sesión

### Requirement: Protección de páginas privadas
Las páginas marcadas como privadas SHALL mostrarse solo con una sesión activa. Sin ella, la aplicación SHALL redirigir a `/login` sustituyendo la entrada del historial, de modo que "atrás" no vuelva a la página protegida.

#### Scenario: Acceso sin sesión
- **GIVEN** el usuario no tiene sesión
- **WHEN** abre `/`
- **THEN** se muestra la página de login en `/login`
- **AND** la lista de beyblades no se muestra ni se piden sus datos

#### Scenario: Acceso con sesión
- **GIVEN** el usuario tiene una sesión activa
- **WHEN** abre `/`
- **THEN** se muestra la lista de beyblades

### Requirement: Login con sesión activa
Si un usuario con una sesión activa abre `/login`, la aplicación SHALL redirigirlo a la página principal.

#### Scenario: Abrir el login ya identificado
- **GIVEN** el usuario tiene una sesión activa
- **WHEN** abre `/login`
- **THEN** se navega a `/`

## REMOVED Requirements

### Requirement: Expiración de la sesión
**Reason**: La sesión ya no es un token guardado por la aplicación con una expiración fija; el servicio de autenticación la mantiene y renueva sus credenciales mientras la cuenta siga habilitada.
**Migration**: La sesión dura hasta que el usuario cierra sesión o su cuenta se deshabilita (ver "Sesión persistente" y "Cierre de sesión"). Las sesiones antiguas guardadas en `localStorage` (`lvb-auth`) se ignoran y se borran.

### Requirement: Endpoint simulado de login
**Reason**: Se elimina la API simulada; el login se hace contra el servicio de autenticación real.
**Migration**: Las cuentas de prueba se crean en el proyecto de Firebase; los tests usan una implementación en memoria del acceso a autenticación.

### Requirement: Sesión guardada inválida
**Reason**: La aplicación ya no guarda la sesión por su cuenta; la persistencia la gestiona el servicio de autenticación.
**Migration**: Ninguna para el usuario. Una sesión antigua en `localStorage` se descarta al arrancar.

### Requirement: Token de login inválido
**Reason**: La aplicación ya no recibe ni decodifica un token de login; el servicio de autenticación entrega la sesión directamente.
**Migration**: Un perfil inválido se trata como cuenta no habilitada (ver `access-control`, "Cuenta no habilitada"); cualquier otro fallo del servicio, como error inesperado.
