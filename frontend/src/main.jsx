import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './index.css'
import { AuthProvider } from './Auth'
import { AuthLayout } from './AuthLayout'
import { Layout } from './Layout'
import { Home } from './Home'
import { NoEncontrado } from './NoEncontrado'
import { Login } from './Login'
import { Registro } from './Registro'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="registro" element={<Registro />} />

            {/* Rutas protegidas: solo con sesion iniciada */}
            <Route element={<AuthLayout />}>
              <Route path="vehiculos" element={<p>Vehículos (próximamente)</p>} />
            </Route>

            <Route path="*" element={<NoEncontrado />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
)
