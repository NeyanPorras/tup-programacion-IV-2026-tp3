import { useEffect, useState } from 'react'
import { useAuth } from './Auth'
import { hoy } from './validacionesForm'

// Selector de conductores cargado desde el backend.
// Recibe el id elegido (texto) y avisa los cambios con onChange.
export function ConductoresSelect({ id = 'conductorId', valor, onChange, invalido }) {
  const { fetchAuth } = useAuth()
  const [conductores, setConductores] = useState([])

  useEffect(() => {
    let activo = true

    fetchAuth('/conductores').then(({ ok, datos }) => {
      if (activo && ok) setConductores(datos)
    })

    return () => {
      activo = false
    }
  }, [fetchAuth])

  const fechaDeHoy = hoy()

  return (
    <select
      id={id}
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={invalido}
    >
      <option value="">Elegí un conductor</option>
      {conductores.map((conductor) => (
        <option key={conductor.id} value={conductor.id}>
          {conductor.apellido}, {conductor.nombre}
          {conductor.fechaVencimientoLicencia < fechaDeHoy
            ? ' (licencia vencida)'
            : ''}
        </option>
      ))}
    </select>
  )
}
