# Spec Delta

## Purpose

Garantiza que los datos que la aplicación recibe de la API, los que le envía y su configuración cumplen un contrato definido, y que un incumplimiento se trata como un error controlado en lugar de romper la interfaz.

## ADDED Requirements

### Requirement: Respuesta fuera de contrato
Si una respuesta correcta (2xx) de la API no cumple el contrato del endpoint (falta un campo, sobra un `null` o un valor tiene otro tipo), la aplicación SHALL tratarla como un error inesperado y mostrar el mensaje de error de esa vista. MUST NOT mostrar datos parciales ni dejar de responder.

#### Scenario: Listado con un campo de tipo inesperado
- **GIVEN** el usuario tiene sesión
- **WHEN** la API responde al listado de beyblades con un elemento cuyo `wins` es `"diez"`
- **THEN** se muestra "No se pudieron cargar los beyblades."
- **AND** no se muestra ninguna tarjeta

#### Scenario: Listado con un campo ausente
- **WHEN** la API responde al listado de beyblades con un elemento sin `name`
- **THEN** se muestra "No se pudieron cargar los beyblades."

### Requirement: Campos adicionales en las respuestas
La aplicación SHALL aceptar respuestas que, además de los campos del contrato, incluyan campos que no conoce, y SHALL ignorar esos campos.

#### Scenario: La API añade un campo nuevo
- **WHEN** la API responde al listado de beyblades con elementos válidos que además tienen un campo `image`
- **THEN** el listado se muestra con normalidad

### Requirement: Peticiones ajustadas al contrato
Las peticiones que la aplicación envía a la API SHALL contener exactamente los campos de su contrato. Si los datos que se van a enviar no lo cumplen, la petición MUST NOT enviarse y la vista SHALL mostrar su mensaje de error inesperado.

#### Scenario: Cuerpo del login
- **WHEN** el usuario inicia sesión
- **THEN** el cuerpo de la petición contiene solo `email` y `password`

### Requirement: Configuración validada al arrancar
Al arrancar, la aplicación SHALL validar sus variables de configuración (`VITE_*`). Si alguna tiene un valor no permitido o no es una variable conocida, la aplicación MUST NOT arrancar e SHALL informar del error indicando el nombre de la variable.

#### Scenario: Valor no permitido
- **WHEN** la aplicación arranca con `VITE_API_MOCKING=yes`
- **THEN** no arranca y el error indica que `VITE_API_MOCKING` debe ser `enabled` o `disabled`

#### Scenario: Variable desconocida
- **WHEN** la aplicación arranca con una variable `VITE_API_BASEURL` (errata de `VITE_API_BASE_URL`)
- **THEN** no arranca y el error nombra `VITE_API_BASEURL` como variable desconocida

#### Scenario: Configuración válida u omitida
- **WHEN** la aplicación arranca sin variables `VITE_*`
- **THEN** arranca con los valores por defecto (`/api` como base de la API y mocks desactivados)

### Requirement: Datos simulados conformes al contrato
Con los mocks activos, los datos que devuelve la API simulada SHALL cumplir el mismo contrato que se exige a la API real.

#### Scenario: Listado simulado
- **WHEN** con los mocks activos se pide el listado de beyblades
- **THEN** cada elemento de la respuesta cumple el contrato de beyblade
