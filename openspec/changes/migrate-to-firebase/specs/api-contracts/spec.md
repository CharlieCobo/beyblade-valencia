# Spec Delta

## MODIFIED Requirements

### Requirement: Respuesta fuera de contrato
Si los datos leídos del almacenamiento no cumplen el contrato de su entidad (falta un campo, sobra un `null` o un valor tiene otro tipo), la aplicación SHALL tratarlos como un error inesperado y mostrar el mensaje de error de esa vista. MUST NOT mostrar datos parciales ni dejar de responder.

#### Scenario: Listado con un campo de tipo inesperado
- **GIVEN** el usuario tiene sesión
- **WHEN** uno de los beyblades almacenados tiene `wins` igual a `"diez"`
- **THEN** se muestra "No se pudieron cargar los beyblades."
- **AND** no se muestra ninguna tarjeta

#### Scenario: Listado con un campo ausente
- **WHEN** uno de los beyblades almacenados no tiene `name`
- **THEN** se muestra "No se pudieron cargar los beyblades."

### Requirement: Campos adicionales en las respuestas
La aplicación SHALL aceptar datos almacenados que, además de los campos del contrato, incluyan campos que no conoce, y SHALL ignorar esos campos.

#### Scenario: La API añade un campo nuevo
- **WHEN** los beyblades almacenados son válidos y además tienen un campo `image`
- **THEN** el listado se muestra con normalidad

### Requirement: Configuración validada al arrancar
Al arrancar, la aplicación SHALL validar sus variables de configuración (`VITE_*`). Las variables de conexión con Firebase (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` y `VITE_FIREBASE_APP_ID`) son obligatorias. Si falta alguna, alguna tiene un valor no permitido o no es una variable conocida, la aplicación MUST NOT arrancar e SHALL informar del error indicando el nombre de la variable.

#### Scenario: Variable obligatoria ausente
- **WHEN** la aplicación arranca sin `VITE_FIREBASE_PROJECT_ID`
- **THEN** no arranca y el error nombra `VITE_FIREBASE_PROJECT_ID`

#### Scenario: Valor no permitido
- **WHEN** la aplicación arranca con `VITE_FIREBASE_AUTH_DOMAIN` vacía
- **THEN** no arranca y el error nombra `VITE_FIREBASE_AUTH_DOMAIN`

#### Scenario: Variable desconocida
- **WHEN** la aplicación arranca con una variable `VITE_FIREBASE_PROJECTID` (errata de `VITE_FIREBASE_PROJECT_ID`)
- **THEN** no arranca y el error nombra `VITE_FIREBASE_PROJECTID` como variable desconocida

#### Scenario: Variable antigua de la API simulada
- **WHEN** la aplicación arranca con `VITE_API_MOCKING=enabled`
- **THEN** no arranca y el error nombra `VITE_API_MOCKING` como variable desconocida

#### Scenario: Configuración válida u omitida
- **WHEN** la aplicación arranca con las cuatro variables de Firebase con valores no vacíos y sin ninguna otra variable `VITE_*`
- **THEN** arranca con normalidad

## REMOVED Requirements

### Requirement: Peticiones ajustadas al contrato
**Reason**: La aplicación ya no envía peticiones HTTP propias: el login lo hace el servicio de autenticación y, por ahora, la aplicación no escribe datos.
**Migration**: Cuando se añada la primera escritura de datos, un nuevo requisito exigirá que lo escrito cumpla el contrato exacto de la entidad.

### Requirement: Datos simulados conformes al contrato
**Reason**: Se elimina la API simulada.
**Migration**: Los datos de los tests siguen saliendo de factories validadas por el esquema de cada entidad (convención del proyecto, no comportamiento de la aplicación).
