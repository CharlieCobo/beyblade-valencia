# Spec Delta

## Purpose

Define qué rol tiene cada cuenta (`ADMIN`, `MEMBER` o `JUDGE`), qué cuentas están habilitadas para usar la aplicación y quién puede leer o escribir cada dato almacenado.

## ADDED Requirements

### Requirement: Perfil con rol
Cada cuenta habilitada SHALL tener un perfil almacenado, identificado por la cuenta, con un rol que es exactamente uno de `ADMIN`, `MEMBER` o `JUDGE`. Tras iniciar sesión, la aplicación SHALL conocer el rol del usuario.

#### Scenario: Miembro inicia sesión
- **GIVEN** una cuenta con un perfil de rol `MEMBER`
- **WHEN** el usuario inicia sesión con ella
- **THEN** entra en la aplicación y su sesión indica el rol `MEMBER`

#### Scenario: Juez inicia sesión
- **GIVEN** una cuenta con un perfil de rol `JUDGE`
- **WHEN** el usuario inicia sesión con ella
- **THEN** entra en la aplicación y su sesión indica el rol `JUDGE`

### Requirement: Cuenta no habilitada
Si una cuenta inicia sesión correctamente pero no tiene perfil, o su perfil no tiene un rol válido, la aplicación MUST NOT dejarla entrar: SHALL cerrar esa sesión y mostrar en el login "Tu cuenta no está habilitada. Contacta con un administrador.".

#### Scenario: Cuenta sin perfil
- **GIVEN** una cuenta con credenciales válidas y sin perfil
- **WHEN** el usuario inicia sesión con ella
- **THEN** se muestra "Tu cuenta no está habilitada. Contacta con un administrador."
- **AND** el usuario sigue en la página de login sin sesión

#### Scenario: Perfil con un rol desconocido
- **GIVEN** una cuenta cuyo perfil tiene el rol `SUPERUSER`
- **WHEN** el usuario inicia sesión con ella
- **THEN** se muestra "Tu cuenta no está habilitada. Contacta con un administrador."
- **AND** el usuario sigue sin sesión

#### Scenario: Sesión recuperada de una cuenta que ya no tiene perfil
- **GIVEN** el usuario tenía sesión y un administrador ha borrado su perfil
- **WHEN** abre la aplicación
- **THEN** se cierra su sesión y se le lleva al login

### Requirement: Lectura de datos solo con perfil
Los datos almacenados de la aplicación (por ahora, los beyblades) SHALL poder leerse solo con una sesión cuya cuenta tenga un perfil con rol válido. Cualquier otro acceso MUST rechazarse en el propio almacenamiento, aunque no pase por la aplicación.

#### Scenario: Lectura sin sesión
- **WHEN** alguien sin sesión intenta leer los beyblades directamente del almacenamiento
- **THEN** la lectura se rechaza

#### Scenario: Lectura con cuenta sin perfil
- **GIVEN** una cuenta creada fuera de la aplicación y sin perfil
- **WHEN** intenta leer los beyblades
- **THEN** la lectura se rechaza

#### Scenario: Lectura de un miembro
- **GIVEN** una cuenta con perfil de rol `MEMBER`
- **WHEN** lee los beyblades
- **THEN** la lectura se permite

### Requirement: Escritura de beyblades reservada a administradores
Crear, modificar o borrar beyblades SHALL permitirse solo a cuentas con rol `ADMIN`. Para `MEMBER`, `JUDGE` y cualquier otro acceso, MUST rechazarse en el almacenamiento.

#### Scenario: Un administrador crea un beyblade
- **GIVEN** una cuenta con rol `ADMIN`
- **WHEN** crea un beyblade
- **THEN** la escritura se permite

#### Scenario: Un juez intenta modificar un beyblade
- **GIVEN** una cuenta con rol `JUDGE`
- **WHEN** intenta modificar un beyblade
- **THEN** la escritura se rechaza

### Requirement: Gestión de perfiles reservada a administradores
Cada usuario SHALL poder leer su propio perfil. Leer perfiles ajenos y crear, modificar o borrar cualquier perfil (incluido el propio, y por tanto su rol) SHALL permitirse solo a cuentas con rol `ADMIN`.

#### Scenario: Un miembro lee su perfil
- **GIVEN** una cuenta con rol `MEMBER`
- **WHEN** lee su propio perfil
- **THEN** la lectura se permite

#### Scenario: Un miembro intenta ascenderse
- **GIVEN** una cuenta con rol `MEMBER`
- **WHEN** intenta cambiar el rol de su propio perfil a `ADMIN`
- **THEN** la escritura se rechaza

#### Scenario: Un miembro intenta leer otro perfil
- **GIVEN** una cuenta con rol `MEMBER`
- **WHEN** intenta leer el perfil de otra cuenta
- **THEN** la lectura se rechaza

#### Scenario: Un administrador asigna un rol
- **GIVEN** una cuenta con rol `ADMIN`
- **WHEN** crea el perfil de otra cuenta con rol `JUDGE`
- **THEN** la escritura se permite
