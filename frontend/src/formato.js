// Funciones para mostrar datos en pantalla

// "2026-03-14" -> "14/03/2026"
// Con hora: "2026-03-14 07:30:00" -> "14/03/2026 07:30"
export function formatearFecha(fecha) {
  const [dia, hora] = fecha.split(' ')
  const fechaArgentina = dia.split('-').reverse().join('/')
  return hora ? `${fechaArgentina} ${hora.slice(0, 5)}` : fechaArgentina
}

// 1500.5 -> "1.500,5"
export const formatearNumero = (numero) => numero.toLocaleString('es-AR')
