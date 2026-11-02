/** El servicio de autenticación rechazó el correo o la contraseña (sin decir cuál). */
export class InvalidCredentialsError extends Error {
  constructor() {
    super('Correo o contraseña incorrectos')
    this.name = 'InvalidCredentialsError'
  }
}

/** Las credenciales son válidas, pero la cuenta no tiene un perfil con rol válido. */
export class AccountNotEnabledError extends Error {
  constructor() {
    super('La cuenta no tiene un perfil habilitado')
    this.name = 'AccountNotEnabledError'
  }
}
