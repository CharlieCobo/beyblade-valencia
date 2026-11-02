# Spec Delta

## REMOVED Requirements

### Requirement: Activación de los mocks por configuración
**Reason**: Se elimina la API simulada: la aplicación usa Firebase en desarrollo, en la demo y en producción.
**Migration**: Desarrollo y demo se conectan al proyecto de Firebase configurado en las variables `VITE_FIREBASE_*`. `VITE_API_MOCKING` deja de existir.

### Requirement: Mocks sin service worker
**Reason**: Sin API simulada en el navegador no hay nada que pueda registrar otro service worker.
**Migration**: Ninguna. El service worker de la PWA sigue siendo el único.

### Requirement: Fuente única de mocks
**Reason**: Ya no hay mocks compartidos entre la demo y los tests; la demo usa datos reales.
**Migration**: Los tests usan implementaciones en memoria del acceso a datos de cada feature, alimentadas con las factories de Faker.

### Requirement: Peticiones sin mock
**Reason**: Se elimina la API simulada.
**Migration**: Ninguna.
