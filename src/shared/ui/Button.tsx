import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant
}

const BASE = 'cursor-pointer rounded-lg border px-[0.9rem] py-[0.4rem] disabled:cursor-progress disabled:opacity-60'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'border-accent bg-accent text-white',
  secondary: 'border-current bg-transparent text-inherit',
}

/** Botón de la app. Por defecto es `type="button"` para no enviar formularios sin querer. */
export function Button({ variant = 'secondary', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={`${BASE} ${VARIANTS[variant]}`} {...props} />
}
