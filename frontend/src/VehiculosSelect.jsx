import { useEffect, useState } from 'react'
import { useAuth } from './Auth'

// Selector de vehiculos cargado desde el backend.
// Recibe el id elegido (texto) y avisa los cambios con onChange.
export function VehiculosSelect({
  id = 'vehiculoId',
  valor,
  onChange,
  invalido,
  textoVacio = 'Elegí un vehículo'
}) {
  const { fetchAuth } = useAuth()
  const [vehiculos, setVehiculos] = useState([])

  useEffect(() => {
    let activo = true

    fetchAuth('/vehiculos').then(({ ok, datos }) => {
      if (activo && ok) setVehiculos(datos)
    })

    return () => {
      activo = false
    }
  }, [fetchAuth])

  return (
    <select
      id={id}
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={invalido}
    >
      <option value="">{textoVacio}</option>
      {vehiculos.map((vehiculo) => (
        <option key={vehiculo.id} value={vehiculo.id}>
          {vehiculo.patente} — {vehiculo.marca} {vehiculo.modelo}
        </option>
      ))}
    </select>
  )
}
