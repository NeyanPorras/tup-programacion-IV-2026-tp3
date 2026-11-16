# Gestión de vehículos, conductores y viajes

Trabajo Práctico N.º 3 de Programación IV (UTN FRLR). Aplicación para registrar
los vehículos de una empresa de transporte, sus conductores y los viajes
realizados, con consulta del historial y del total de kilómetros recorridos por
vehículo o por conductor.

- `backend/`: API REST con Express, MySQL (mysql2), express-validator y
  autenticación con JWT y Passport.
- `frontend/`: aplicación con Vite y React (React Router, CSS puro).

## Cómo ejecutar

Requisitos: Node.js 24 o superior, pnpm y MySQL 8.

### 1. Base de datos

Desde `backend/`, crear la base `tp3` y sus tablas:

```bash
mysql -u root -p < database.sql
```

Opcionalmente, cargar datos de prueba (3 vehículos, 3 conductores y 4 viajes):

```bash
mysql -u root -p < datos.sql
```

`database.sql` borra y vuelve a crear las tablas, así que sirve también para
volver a empezar desde cero.

### 2. Backend

Copiar `backend/.env.example` a `backend/.env` y completar los valores:

| Variable      | Descripción                                   |
| ------------- | --------------------------------------------- |
| `DB_HOST`     | Servidor de MySQL, por ejemplo `localhost`    |
| `DB_USER`     | Usuario de MySQL                              |
| `DB_PASSWORD` | Contraseña de MySQL                           |
| `DB_DATABASE` | Nombre de la base: `tp3`                      |
| `JWT_SECRET`  | Clave para firmar los tokens (larga y aleatoria) |

Una clave adecuada para `JWT_SECRET` se genera con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Luego:

```bash
cd backend
pnpm install
pnpm dev
```

La API queda disponible en `http://localhost:3000`.

### 3. Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

La aplicación queda disponible en `http://localhost:5173`. Para usarla hay que
crear una cuenta desde "Registrarse".

## Estructura

La estructura de carpetas sigue la vista en clase: archivos planos, un router y
un archivo `.http` por recurso.

```
backend/
├── index.js          Servidor, rutas y manejo de errores
├── db.js             Conexión a MySQL
├── auth.js           Registro, inicio de sesión y estrategia JWT de Passport
├── validaciones.js   Reglas de express-validator y middlewares comunes
├── vehiculos.js      Rutas de /vehiculos
├── conductores.js    Rutas de /conductores
├── viajes.js         Rutas de /viajes e historial de viajes
├── database.sql      Definición de las tablas
├── datos.sql         Datos de prueba
└── *.http            Pruebas de la API

frontend/src/
├── main.jsx                 Rutas de la aplicación
├── Auth.jsx                 Contexto de sesión y fetchAuth
├── AuthLayout.jsx           Protección de rutas
├── Layout.jsx               Menú y estructura de la página
├── Home.jsx                 Página principal pública
├── Login.jsx, Registro.jsx  Inicio de sesión y registro
├── Vehiculos.jsx, VehiculoForm.jsx, VehiculoDetalles.jsx
├── Conductores.jsx, ConductorForm.jsx, ConductorDetalles.jsx
├── Viajes.jsx, ViajeCrear.jsx, TablaViajes.jsx
├── VehiculosSelect.jsx, ConductoresSelect.jsx
├── api.js, formato.js, validacionesForm.js
└── index.css
```

## Modelo de datos

| Tabla         | Columnas                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------- |
| `usuarios`    | `id`, `nombre`, `email` (único), `password` (hash bcrypt)                                      |
| `vehiculos`   | `id`, `marca`, `modelo`, `patente` (única), `anio`, `capacidad_carga`                          |
| `conductores` | `id`, `nombre`, `apellido`, `documento` (único), `licencia` (única), `fecha_alta_licencia`, `fecha_vencimiento_licencia` |
| `viajes`      | `id`, `vehiculo_id` (FK), `conductor_id` (FK), `fecha_salida`, `fecha_llegada`, `origen`, `destino`, `kilometros`, `observaciones` |

Un vehículo y un conductor pueden tener muchos viajes; cada viaje pertenece a un
vehículo y a un conductor. Las claves foráneas usan `ON DELETE RESTRICT`: no se
puede eliminar un vehículo o un conductor que tiene viajes registrados, para no
perder ni dejar huérfano el historial.

## API

Todas las rutas, salvo registro e inicio de sesión, requieren el encabezado
`Authorization: Bearer <token>`.

| Método   | Ruta                        | Descripción                                        |
| -------- | --------------------------- | -------------------------------------------------- |
| `POST`   | `/auth/registro`            | Registra un usuario                                |
| `POST`   | `/auth/login`               | Inicia sesión y devuelve el token                  |
| `GET`    | `/auth/perfil`              | Datos del usuario del token                        |
| `GET`    | `/vehiculos`                | Lista los vehículos                                |
| `GET`    | `/vehiculos/:id`            | Obtiene un vehículo                                |
| `GET`    | `/vehiculos/:id/viajes`     | Historial del vehículo y total de kilómetros       |
| `POST`   | `/vehiculos`                | Crea un vehículo                                   |
| `PUT`    | `/vehiculos/:id`            | Modifica un vehículo                               |
| `DELETE` | `/vehiculos/:id`            | Elimina un vehículo sin viajes                     |
| `GET`    | `/conductores`              | Lista los conductores                              |
| `GET`    | `/conductores/:id`          | Obtiene un conductor                               |
| `GET`    | `/conductores/:id/viajes`   | Historial del conductor y total de kilómetros      |
| `POST`   | `/conductores`              | Crea un conductor                                  |
| `PUT`    | `/conductores/:id`          | Modifica un conductor                              |
| `DELETE` | `/conductores/:id`          | Elimina un conductor sin viajes                    |
| `GET`    | `/viajes`                   | Lista los viajes; filtros `?vehiculoId=` y `?conductorId=` |
| `GET`    | `/viajes/:id`               | Obtiene un viaje                                   |
| `POST`   | `/viajes`                   | Registra un viaje                                  |

### Códigos de estado

| Código | Cuándo se usa                                                                 |
| ------ | ----------------------------------------------------------------------------- |
| `200`  | Consulta, modificación o eliminación exitosa                                  |
| `201`  | Creación exitosa                                                              |
| `400`  | Datos inválidos, JSON mal formado, valor repetido o eliminación bloqueada por viajes |
| `401`  | Token ausente, inválido o vencido; credenciales incorrectas en el inicio de sesión |
| `404`  | El recurso de la ruta no existe, o la ruta misma                              |
| `500`  | Error interno; el detalle se registra en el servidor y no se envía al cliente |

Todas las respuestas, incluidas las de error, se devuelven en JSON.

### Pruebas

Cada archivo `.http` de `backend/` prueba los casos válidos y los inválidos de
su recurso, con el código esperado en el título de cada pedido. Dependen del
orden y suponen una base recién creada:

- `auth.http`: base vacía (`database.sql`).
- `vehiculos.http`, `conductores.http` y `viajes.http`: base con `datos.sql` y el
  usuario de `auth.http` registrado. Cada uno empieza con un pedido `login` cuyo
  token usan los demás.

## Decisiones de diseño

### Autenticación y seguridad

- **Contraseñas con bcrypt** (costo 12). En la base se guarda solo el hash, y
  ninguna respuesta incluye la contraseña ni el hash.
- **Tokens JWT con vencimiento de 4 horas**, firmados con `JWT_SECRET`. El token
  lleva el id y el nombre del usuario; nunca datos privados, porque su contenido
  se puede leer sin la clave.
- **Passport con la estrategia JWT** protege todas las operaciones CRUD. El
  middleware responde un 401 en JSON en lugar del texto plano por defecto de
  Passport, para que el frontend siempre reciba el mismo formato.
- **El inicio de sesión responde el mismo 401** si el email no existe o la
  contraseña es incorrecta, para no revelar qué emails están registrados.
- **El registro es público.** El enunciado pide registro de usuarios y define al
  usuario sin rol, por lo que cualquier persona puede crear una cuenta y todos
  los usuarios autenticados tienen los mismos permisos.
- **No hay respuestas 403.** El 403 indica que alguien identificado no tiene
  permiso para una acción; sin roles, esa situación no existe. La falta de
  autenticación se responde con 401.
- **Las contraseñas tienen entre 8 y 72 caracteres**, con al menos una minúscula
  y un número. El máximo de 72 se debe a bcrypt, que ignora lo que excede ese
  largo.

### Validación

- **express-validator valida cuerpo, parámetros y consultas** en todas las rutas
  de obtención, creación y modificación. Las reglas viven en `validaciones.js` y
  se reutilizan entre rutas.
- **El frontend repite las mismas reglas** para avisar antes de enviar, y el
  backend vuelve a validar todo: la validación del navegador es comodidad, la
  del servidor es la que protege los datos.
- **Patente** en formato argentino: `AAA123` o `AA123AA`, guardada en mayúsculas.
- **Año** entre 1950 y el año siguiente al actual, para incluir modelos del año
  próximo.
- **Documento** de 7 u 8 dígitos sin puntos, guardado como texto porque es un
  identificador y no una cantidad.
- **La fecha de vencimiento de la licencia** debe ser posterior a la de alta.
- **Un viaje** debe referir a un vehículo y un conductor existentes, llegar en la
  misma fecha y hora de salida o después, y tener kilómetros mayores que cero.
- **La licencia debe estar vigente en la fecha de salida del viaje.** No lo pide
  el enunciado, pero un viaje con la licencia vencida es un dato que la empresa
  no debería poder registrar.
- **Los valores repetidos** (email, patente, documento, licencia) los detecta la
  base mediante claves únicas y se informan con un mensaje claro. Detectarlos en
  la base y no con una consulta previa evita que dos pedidos simultáneos se
  cuelen.

### Datos

- **Fechas como texto `AAAA-MM-DD`.** La conexión usa `dateStrings: true`; sin
  esa opción, mysql2 convierte las fechas en objetos `Date` y la zona horaria
  puede correrlas un día. Ese formato coincide con el que usan los inputs de
  fecha del navegador y se compara bien como texto.
- **`DECIMAL` para kilómetros y capacidad de carga**, porque es exacto. mysql2 lo
  devuelve como texto, y la API lo convierte a número antes de responder.
- **La base usa `snake_case` y la API `camelCase`.** Cada router traduce las filas
  a la forma de la API en una sola función.
- **El total de kilómetros** del historial de un vehículo o conductor lo calcula
  la base con `SUM`. En la página de viajes, el total corresponde a los viajes
  mostrados con el filtro aplicado.

### Frontend

- **La sesión se guarda en `localStorage`**, para que sobreviva a una recarga de
  la página. Al iniciar se descarta si el token ya venció, y cualquier respuesta
  401 del backend cierra la sesión y lleva al inicio de sesión.
- **Las rutas protegidas** redirigen al inicio de sesión y, después de ingresar,
  vuelven a la página que se había pedido.
- **Un mismo formulario** sirve para crear y para modificar vehículos y
  conductores, según la ruta tenga o no un id.
- **CSS puro**, con variables para los colores y modo oscuro automático según el
  sistema.

### Fuera de alcance

- **Modificar y eliminar viajes** no se implementó: el enunciado pide la carga y
  la visualización de viajes.
- **La conexión a la base es única** (`createConnection`), como en el código visto
  en clase. Si MySQL cierra esa conexión, la API devuelve errores hasta reiniciar
  el servidor; un pool de conexiones (`createPool`) la repondría solo.
