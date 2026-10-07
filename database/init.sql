CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    precio NUMERIC(12, 2) NOT NULL CHECK (precio >= 0),
    stock INT NOT NULL CHECK (stock >= 0),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compras (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    CONSTRAINT fk_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
);

INSERT INTO clientes (nombre, email)
VALUES
    ('Laura Gómez', 'laura.gomez@example.com'),
    ('Andrés Ruiz', 'andres.ruiz@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO productos (nombre, precio, stock)
VALUES
    ('Teclado Mecanico', 180000.00, 15),
    ('Mouse Inalambrico', 65000.00, 30)
ON CONFLICT DO NOTHING;
