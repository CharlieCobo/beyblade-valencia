import { describe, expect, it } from 'vitest'
import indexHtml from '../../../index.html?raw'

// El tema oscuro se fija en el HTML estático para que el primer pintado ya sea oscuro,
// antes de que se ejecute JavaScript (spec `theming`).
describe('index.html', () => {
  const doc = new DOMParser().parseFromString(indexHtml, 'text/html')
  const html = doc.documentElement

  it('aplica el tema oscuro con la clase dark en <html>', () => {
    expect(html.classList.contains('dark')).toBe(true)
  })

  it('declara el esquema de color oscuro para los controles nativos', () => {
    expect(html.style.colorScheme).toBe('dark')
    expect(doc.querySelector('meta[name="color-scheme"]')?.getAttribute('content')).toBe('dark')
  })

  it('usa el fondo oscuro como color de la barra del navegador', () => {
    expect(doc.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#121212')
  })
})
