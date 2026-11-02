# Spec Delta

## MODIFIED Requirements

### Requirement: Formulario de inicio de sesión
La página de login SHALL mostrar un formulario con un campo de correo, un campo de contraseña y un botón "Iniciar sesión". El formulario MUST NOT enviarse si el correo está vacío o no tiene formato de correo, o si la contraseña está vacía, y SHALL mostrar bajo cada campo inválido el mensaje correspondiente: "Introduce tu correo", "Introduce un correo válido" o "Introduce tu contraseña".

#### Scenario: Campos vacíos
- **GIVEN** el usuario está en la página de login
- **WHEN** pulsa "Iniciar sesión" con los campos vacíos
- **THEN** no se envía ninguna petición a la API
- **AND** bajo el correo se muestra "Introduce tu correo"
- **AND** bajo la contraseña se muestra "Introduce tu contraseña"

#### Scenario: Correo con formato inválido
- **WHEN** el usuario escribe `test-mail.com` como correo y pulsa "Iniciar sesión"
- **THEN** no se envía ninguna petición a la API
- **AND** bajo el correo se muestra "Introduce un correo válido"

#### Scenario: Correo con espacios alrededor
- **WHEN** el usuario escribe ` test@mail.com ` como correo, `Test1234!` como contraseña y pulsa "Iniciar sesión"
- **THEN** se envía la petición de login con el correo `test@mail.com`, sin espacios
