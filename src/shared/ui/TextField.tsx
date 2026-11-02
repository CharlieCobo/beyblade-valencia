import { useId, type ComponentProps } from 'react'

interface TextFieldProps extends Omit<ComponentProps<'input'>, 'className' | 'id'> {
  label: string
  /** Mensaje de error visible bajo el campo. Sin él, el campo no se marca como inválido. */
  error?: string
}

const INPUT =
  'rounded-lg border bg-background px-[0.7rem] py-[0.55rem] text-foreground focus-visible:outline-2 focus-visible:outline-offset-1'

/**
 * Campo de texto con etiqueta y mensaje de error accesible. Acepta lo que devuelve `register(name)` de
 * React Hook Form, incluida la `ref` (en React 19 es una prop más), que hace falta para enfocar el campo.
 */
export function TextField({ label, error, ...inputProps }: TextFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="grid gap-[0.35rem]">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className={`${INPUT} ${error ? 'border-danger focus-visible:outline-danger' : 'border-foreground/30 focus-visible:outline-accent'}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="m-0 text-[0.9rem] text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
