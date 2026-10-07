# sistema-compras con db

## Participantes

- Nicolás Francisco Ortiz Luna - 20212020079
- Daniel Felipe Barrera Suarez - 20212020097
- Daniel Felipe Gomez Miranda - 20212020101

**Asignatura:** Ingeniería de Software para la web backend

---

## Descripción del sistema

El sistema consta de 3 microservicios que se comunican entre sí:

- `cliente-api` (Puerto 3001)
- `producto-api` (Puerto 3002)
- `compra-api` (Puerto 3003)

El servicio **`compra-api`** actúa como orquestador, comunicándose mediante peticiones HTTP con los otros dos servicios para validar la existencia del cliente, verificar el stock del producto y procesar la transacción.

## Ejecución con Docker Compose

Desde la raíz del proyecto, primero configura las variables de entorno:

```bash
cp .env.example .env
```

Edita `.env` (raíz) con tus valores. Este archivo lo lee **docker compose** en
tu máquina para resolver las variables `${...}` de `docker-compose.yml`; no se
copia a los contenedores. Si falta una variable crítica, compose falla con un
mensaje de error indicando cuál.

Luego:

```bash
docker compose up --build
```

Esto inicia PostgreSQL y los tres microservicios:

- `cliente-api`: http://localhost:3001
- `producto-api`: http://localhost:3002
- `compra-api`: http://localhost:3003

La base de datos utiliza el volumen `postgres_data`. El script `database/init.sql`
se ejecuta automáticamente únicamente cuando PostgreSQL se inicializa por primera vez.
Para eliminar también los datos persistidos:

```bash
docker compose down -v
```

### Variables de entorno

| Archivo | Quién lo lee | Cuándo se usa |
|---|---|---|
| `/.env` (raíz) | docker compose (interpolación `${VAR}`) | `docker compose up` |
| `*/.env` (por servicio) | `dotenv` dentro del proceso Node | Ejecución local sin Docker (`node src/server.js`) |

Los `.env` de cada servicio contienen valores para desarrollo local
(`DB_HOST=localhost`, URLs `http://localhost:...`). **No se usan con Docker**:
los contenedores reciben su configuración desde los `environment:` del
`docker-compose.yml`, alimentados por el `.env` raíz. Los `.env` de cada
servicio y el raíz no se commitean (`.gitignore`); usa los `.env.example`
como plantilla.

---

## Base de Datos (PostgreSQL)

El proyecto utiliza una base de datos relacional PostgreSQL llamada `sistema_compras`.

### Script de creación e inserción de datos iniciales

```sql
-- 1. Tabla Clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla Productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    precio NUMERIC(12, 2) NOT NULL CHECK (precio >= 0),
    stock INT NOT NULL CHECK (stock >= 0),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla Compras
CREATE TABLE compras (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    CONSTRAINT fk_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
);

-- Insertar clientes iniciales
INSERT INTO clientes (nombre, email) VALUES 
('Laura Gómez', 'laura.gomez@example.com'),
('Andrés Ruiz', 'andres.ruiz@example.com');

-- Insertar productos iniciales
INSERT INTO productos (nombre, precio, stock) VALUES 
('Teclado Mecanico', 180000.00, 15),
('Mouse Inalambrico', 65000.00, 30);