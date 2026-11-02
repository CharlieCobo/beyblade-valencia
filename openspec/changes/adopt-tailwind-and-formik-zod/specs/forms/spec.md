# Spec Delta

## Purpose

Define el comportamiento común de los formularios de la aplicación: cuándo se validan los datos, cómo se muestran los errores junto a cada campo de forma accesible y cuándo se permite el envío.

## ADDED Requirements

### Requirement: Validación propia en lugar de la nativa
Los formularios de la aplicación SHALL validar los datos con reglas propias y mostrar mensajes en español. MUST NOT depender de los avisos nativos de validación del navegador.

#### Scenario: Envío con un campo obligatorio vacío
- **GIVEN** un formulario con un campo obligatorio
- **WHEN** el usuario lo envía con ese campo vacío
- **THEN** se muestra bajo el campo un mensaje en español que explica el problema
- **AND** el navegador no muestra su aviso nativo

### Requirement: Envío bloqueado con errores
Un formulario SHALL NOT enviar sus datos mientras alguno de sus campos tenga un error de validación.

#### Scenario: Datos inválidos
- **WHEN** el usuario envía un formulario con algún campo inválido
- **THEN** no se envía ninguna petición
- **AND** se muestran los errores de todos los campos inválidos

### Requirement: Momento en que se muestran los errores
El error de un campo SHALL mostrarse solo cuando el usuario ha salido de ese campo o ha intentado enviar el formulario. Una vez visible, el error SHALL actualizarse mientras el usuario escribe y desaparecer en cuanto el valor sea válido.

#### Scenario: Formulario recién abierto
- **WHEN** el usuario abre un formulario sin tocar ningún campo
- **THEN** no se muestra ningún error

#### Scenario: Salir de un campo inválido
- **WHEN** el usuario escribe un valor inválido en un campo y pasa al siguiente
- **THEN** se muestra el error de ese campo
- **AND** no se muestran errores de los campos que aún no ha tocado

#### Scenario: Corregir el valor
- **GIVEN** un campo muestra un error
- **WHEN** el usuario escribe un valor válido
- **THEN** el error desaparece sin necesidad de salir del campo

### Requirement: Errores accesibles
Cada campo con un error visible SHALL marcarse como inválido para las tecnologías de asistencia y SHALL asociarse a su mensaje de error para que este se anuncie junto al campo.

#### Scenario: Campo con error
- **WHEN** un campo muestra un error
- **THEN** el campo está marcado como inválido (`aria-invalid="true"`)
- **AND** su descripción accesible incluye el texto del error

#### Scenario: Campo sin error
- **WHEN** un campo no muestra error
- **THEN** el campo no está marcado como inválido
