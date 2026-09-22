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