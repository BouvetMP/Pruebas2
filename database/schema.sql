-- ¿Qué? Esquema completo de TriDa para Docker (tablas + funciones)
-- ¿Para qué? Permite levantar PostgreSQL desde cero con docker compose up
-- ¿Impacto? Sin este archivo, el backend no arranca y la entrega falla

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS trida;
SET search_path TO trida, public;

-- ============================================================
-- TABLAS
-- ============================================================

CREATE TABLE trida.bancos (
    id_banco        SERIAL PRIMARY KEY,
    codigo          VARCHAR(50) UNIQUE NOT NULL,
    nombre          VARCHAR(120) NOT NULL,
    color           VARCHAR(20) NOT NULL,
    estado          BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE trida.clientes (
    id_cliente          SERIAL PRIMARY KEY,
    id_banco            INTEGER NOT NULL DEFAULT 1
                            REFERENCES trida.bancos (id_banco)
                            ON UPDATE CASCADE ON DELETE RESTRICT,
    nombre_completo     VARCHAR(150) NOT NULL,
    email               VARCHAR(254) NOT NULL UNIQUE,
    telefono            VARCHAR(20) NOT NULL,
    fecha_registro      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    estado              BOOLEAN NOT NULL DEFAULT TRUE,
    pais                VARCHAR(100) NOT NULL,
    ciudad              VARCHAR(100) NOT NULL,
    CONSTRAINT chk_clientes_email_formato CHECK (
        email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    )
);

CREATE TABLE trida.usuarios_sistemas (
    id_usuario              SERIAL PRIMARY KEY,
    nombre_completo         VARCHAR(150) NOT NULL,
    email                   VARCHAR(254) NOT NULL UNIQUE,
    password_hash           TEXT NOT NULL,
    rol                     VARCHAR(30) NOT NULL,
    fecha_creacion          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ultimo_acceso           TIMESTAMPTZ,
    estado                  BOOLEAN NOT NULL DEFAULT TRUE,
    id_usuario_generador    INTEGER REFERENCES trida.usuarios_sistemas (id_usuario),
    CONSTRAINT chk_usuarios_email_formato CHECK (
        email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    ),
    CONSTRAINT chk_rol CHECK (
        rol IN ('ADMINISTRADOR', 'ANALISTA', 'OPERADOR', 'AUDITOR')
    )
);

CREATE TABLE trida.dispositivos (
    id_dispositivo      SERIAL PRIMARY KEY,
    id_cliente          INTEGER NOT NULL
                            REFERENCES trida.clientes (id_cliente)
                            ON UPDATE CASCADE ON DELETE RESTRICT,
    tipo_dispositivo    VARCHAR(50) NOT NULL,
    identificador_unico VARCHAR(255) NOT NULL UNIQUE,
    sistema_operativo   VARCHAR(100) NOT NULL,
    navegador           VARCHAR(100) NOT NULL,
    fecha_primer_uso    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_ultimo_uso    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_fechas_dispositivo CHECK (
        fecha_ultimo_uso >= fecha_primer_uso
    )
);

CREATE TABLE trida.historico_de_ubicacion (
    id_ubicacion        SERIAL PRIMARY KEY,
    id_dispositivo      INTEGER NOT NULL
                            REFERENCES trida.dispositivos (id_dispositivo)
                            ON UPDATE CASCADE ON DELETE RESTRICT,
    direccion_ip        INET NOT NULL,
    pais                VARCHAR(100) NOT NULL,
    ciudad              VARCHAR(100) NOT NULL,
    latitud             NUMERIC(9, 6),
    longitud            NUMERIC(9, 6),
    fecha_registro      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_latitud CHECK (latitud BETWEEN -90 AND 90),
    CONSTRAINT chk_longitud CHECK (longitud BETWEEN -180 AND 180)
);

CREATE TABLE trida.transacciones (
    id_transaccion          SERIAL PRIMARY KEY,
    id_cliente              INTEGER NOT NULL
                                REFERENCES trida.clientes (id_cliente)
                                ON UPDATE CASCADE ON DELETE RESTRICT,
    id_dispositivo          INTEGER NOT NULL
                                REFERENCES trida.dispositivos (id_dispositivo)
                                ON UPDATE CASCADE ON DELETE RESTRICT,
    id_ubicacion            INTEGER NOT NULL
                                REFERENCES trida.historico_de_ubicacion (id_ubicacion)
                                ON UPDATE CASCADE ON DELETE RESTRICT,
    id_banco                INTEGER NOT NULL DEFAULT 1
                                REFERENCES trida.bancos (id_banco)
                                ON UPDATE CASCADE ON DELETE RESTRICT,
    tipo_transaccion        VARCHAR(50) NOT NULL,
    monto                   NUMERIC(15, 2) NOT NULL,
    cuenta_origen           VARCHAR(30) NOT NULL,
    cuenta_destino          VARCHAR(30) NOT NULL,
    fecha_transaccion       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    score_riesgo            NUMERIC(5, 1),
    estado_transaccion      VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    es_fraude_real          BOOLEAN,
    tiempo_de_procesamiento INTEGER NOT NULL DEFAULT 0,
    moneda                  CHAR(3) NOT NULL DEFAULT 'COP',
    canal                   VARCHAR(20) NOT NULL DEFAULT 'web',
    CONSTRAINT chk_monto_positivo CHECK (monto > 0),
    CONSTRAINT chk_score_riesgo CHECK (score_riesgo BETWEEN 0 AND 100),
    CONSTRAINT chk_estado_transaccion CHECK (
        estado_transaccion IN ('PENDIENTE', 'APROBADA', 'ALERTADA', 'BLOQUEADA')
    ),
    CONSTRAINT chk_tiempo_procesamiento CHECK (tiempo_de_procesamiento >= 0),
    CONSTRAINT chk_moneda CHECK (moneda ~ '^[A-Z]{3}$'),
    CONSTRAINT chk_canal_transaccion CHECK (
        canal IN ('mobile', 'web', 'pos', 'atm', 'branch')
    )
);

CREATE TABLE trida.alertas (
    id_alerta               SERIAL PRIMARY KEY,
    id_transaccion          INTEGER NOT NULL
                                REFERENCES trida.transacciones (id_transaccion)
                                ON UPDATE CASCADE ON DELETE RESTRICT,
    nivel_criticidad        VARCHAR(10) NOT NULL,
    fecha_generacion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    factores_sospechosos    TEXT,
    estado_alerta           VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    prioridad               SMALLINT NOT NULL DEFAULT 1,
    CONSTRAINT chk_nivel_criticidad CHECK (
        nivel_criticidad IN ('BAJA', 'MEDIA', 'ALTA', 'CRITICA')
    ),
    CONSTRAINT chk_estado_alerta CHECK (
        estado_alerta IN ('ACTIVA', 'EN_REVISION', 'RESUELTA', 'DESCARTADA')
    ),
    CONSTRAINT chk_prioridad CHECK (prioridad BETWEEN 1 AND 10)
);

CREATE TABLE trida.validaciones (
    id_validacion       SERIAL PRIMARY KEY,
    id_alerta           INTEGER NOT NULL
                            REFERENCES trida.alertas (id_alerta)
                            ON UPDATE CASCADE ON DELETE RESTRICT,
    id_usuario          INTEGER NOT NULL
                            REFERENCES trida.usuarios_sistemas (id_usuario)
                            ON UPDATE CASCADE ON DELETE RESTRICT,
    clasificacion       VARCHAR(35) NOT NULL,
    comentarios         TEXT,
    fecha_validacion    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accion_tomada       VARCHAR(50),
    CONSTRAINT chk_clasificacion CHECK (
        clasificacion IN (
            'FRAUDE_CONFIRMADO', 'FALSO_POSITIVO',
            'PENDIENTE_INVESTIGACION', 'REQUIERE_CONTACTO_CLIENTE'
        )
    )
);

CREATE TABLE trida.reportes (
    id_reporte                  SERIAL PRIMARY KEY,
    id_usuario_generador        INTEGER NOT NULL
                                    REFERENCES trida.usuarios_sistemas (id_usuario)
                                    ON UPDATE CASCADE ON DELETE RESTRICT,
    tipo_reporte                VARCHAR(30) NOT NULL,
    fecha_inicio                TIMESTAMPTZ NOT NULL,
    fecha_fin                   TIMESTAMPTZ NOT NULL,
    total_transacciones         INTEGER,
    total_alertas_generadas     INTEGER,
    fraudes_detectados          INTEGER,
    falsos_positivos            INTEGER,
    tasa_deteccion              NUMERIC(5, 2),
    tiempo_promedio_respuesta   NUMERIC(8, 2),
    monto_protegido             NUMERIC(20, 2),
    fecha_generacion            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ruta_archivo                TEXT NOT NULL,
    CONSTRAINT chk_fechas_reporte CHECK (fecha_fin >= fecha_inicio),
    CONSTRAINT chk_tipo_reporte CHECK (
        tipo_reporte IN ('DIARIO', 'SEMANAL', 'MENSUAL', 'PERSONALIZADO')
    ),
    CONSTRAINT chk_tasa_deteccion CHECK (tasa_deteccion BETWEEN 0 AND 100),
    CONSTRAINT chk_monto_protegido CHECK (monto_protegido >= 0)
);

CREATE TABLE trida.logs_auditoria (
    id_log              SERIAL PRIMARY KEY,
    id_usuario          INTEGER NOT NULL
                            REFERENCES trida.usuarios_sistemas (id_usuario)
                            ON UPDATE CASCADE ON DELETE RESTRICT,
    tipo_accion         VARCHAR(50) NOT NULL,
    entidad_afectada    VARCHAR(50) NOT NULL,
    descripcion         TEXT,
    fecha_accion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    id_identidad        INTEGER NOT NULL,
    direccion_ip        INET NOT NULL
);

-- Inmutabilidad de logs (RS-005)
CREATE RULE logs_no_update AS ON UPDATE TO trida.logs_auditoria DO INSTEAD NOTHING;
CREATE RULE logs_no_delete AS ON DELETE TO trida.logs_auditoria DO INSTEAD NOTHING;

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_bancos_codigo ON trida.bancos (codigo);
CREATE INDEX idx_clientes_id_banco ON trida.clientes (id_banco);
CREATE INDEX idx_clientes_estado ON trida.clientes (estado);
CREATE INDEX idx_clientes_ciudad ON trida.clientes (ciudad);
CREATE INDEX idx_usuarios_rol ON trida.usuarios_sistemas (rol);
CREATE INDEX idx_usuarios_estado ON trida.usuarios_sistemas (estado);
CREATE INDEX idx_dispositivos_id_cliente ON trida.dispositivos (id_cliente);
CREATE INDEX idx_ubicacion_id_dispositivo ON trida.historico_de_ubicacion (id_dispositivo);
CREATE INDEX idx_ubicacion_ciudad ON trida.historico_de_ubicacion (ciudad);
CREATE INDEX idx_transacciones_id_cliente ON trida.transacciones (id_cliente);
CREATE INDEX idx_transacciones_id_banco ON trida.transacciones (id_banco);
CREATE INDEX idx_transacciones_score_riesgo ON trida.transacciones (score_riesgo DESC) WHERE score_riesgo IS NOT NULL;
CREATE INDEX idx_transacciones_fecha ON trida.transacciones (fecha_transaccion DESC);
CREATE INDEX idx_transacciones_estado ON trida.transacciones (estado_transaccion);
CREATE INDEX idx_transacciones_canal ON trida.transacciones (canal);
CREATE INDEX idx_alertas_nivel_criticidad ON trida.alertas (nivel_criticidad);
CREATE INDEX idx_alertas_estado ON trida.alertas (estado_alerta);
CREATE INDEX idx_alertas_fecha ON trida.alertas (fecha_generacion DESC);
CREATE INDEX idx_alertas_nivel_estado ON trida.alertas (nivel_criticidad, estado_alerta);
CREATE INDEX idx_validaciones_clasificacion ON trida.validaciones (clasificacion);
CREATE INDEX idx_validaciones_id_alerta ON trida.validaciones (id_alerta);
CREATE INDEX idx_logs_id_usuario ON trida.logs_auditoria (id_usuario);
CREATE INDEX idx_logs_fecha_accion ON trida.logs_auditoria (fecha_accion DESC);
CREATE INDEX idx_logs_tipo_accion ON trida.logs_auditoria (tipo_accion);

-- ============================================================
-- SEED DE REFERENCIA: Bancos
-- ============================================================
INSERT INTO trida.bancos (codigo, nombre, color) VALUES
    ('sin_asignar', 'Sin banco asignado', '#6366F1'),
    ('bancolombia', 'Bancolombia', '#FFD700'),
    ('davivienda', 'Davivienda', '#E31837'),
    ('bogota', 'Banco de Bogotá', '#003DA5'),
    ('bbva', 'BBVA Colombia', '#004481'),
    ('avvillas', 'AV Villas', '#00A651'),
    ('nequi', 'Nequi', '#7B2D8E'),
    ('daviplata', 'Daviplata', '#FF6B00'),
    ('scotiabank', 'Scotiabank Colpatria', '#EC111A'),
    ('occidente', 'Banco de Occidente', '#006341'),
    ('popular', 'Banco Popular', '#0072CE'),
    ('falabella', 'Banco Falabella', '#00A650');

-- ============================================================
-- SEED DE REFERENCIA: Admin (genera el hash antes, ver abajo)
-- ============================================================
-- Contraseña: Admin1234!
-- Genera el hash con: node -e "require('bcrypt').hash('Admin1234!',12).then(h=>console.log(h))"
-- Reemplaza HASH_AQUI con el resultado:
INSERT INTO trida.usuarios_sistemas (nombre_completo, email, password_hash, rol, estado)
VALUES ('Administrador TriDa', 'admin@trida.co', crypt('Admin1234!', gen_salt('bf', 12)), 'ADMINISTRADOR', TRUE);

-- ============================================================
-- FUNCIONES: Catálogo y datos
-- ============================================================

CREATE OR REPLACE FUNCTION trida.fn_clientes()
RETURNS TABLE (
    id_cliente INTEGER, id_banco INTEGER, nombre_completo VARCHAR(150),
    email VARCHAR(254), telefono VARCHAR(20), fecha_registro TIMESTAMPTZ,
    estado BOOLEAN, pais VARCHAR(100), ciudad VARCHAR(100)
) LANGUAGE sql STABLE AS $$
    SELECT c.id_cliente, c.id_banco, c.nombre_completo, c.email,
           c.telefono, c.fecha_registro, c.estado, c.pais, c.ciudad
    FROM trida.clientes c ORDER BY c.id_cliente ASC;
$$;

CREATE OR REPLACE FUNCTION trida.fn_transacciones(p_banco_codigo VARCHAR DEFAULT NULL)
RETURNS TABLE (
    id_transaccion INTEGER, fecha_transaccion TIMESTAMPTZ, cliente VARCHAR(150),
    banco VARCHAR(120), banco_codigo VARCHAR(50), banco_color VARCHAR(20),
    tipo_transaccion VARCHAR(50), monto NUMERIC(15,2), score_riesgo NUMERIC(5,1),
    estado_transaccion VARCHAR(20), canal VARCHAR(20), ciudad VARCHAR(100), pais VARCHAR(100)
) LANGUAGE sql STABLE AS $$
    SELECT t.id_transaccion, t.fecha_transaccion, c.nombre_completo,
           b.nombre, b.codigo, b.color, t.tipo_transaccion, t.monto,
           t.score_riesgo, t.estado_transaccion, t.canal, u.ciudad, u.pais
    FROM trida.transacciones t
    JOIN trida.clientes c ON c.id_cliente = t.id_cliente
    JOIN trida.bancos b ON b.id_banco = t.id_banco
    JOIN trida.historico_de_ubicacion u ON u.id_ubicacion = t.id_ubicacion
    WHERE p_banco_codigo IS NULL OR b.codigo = p_banco_codigo
    ORDER BY t.fecha_transaccion DESC LIMIT 500;
$$;

CREATE OR REPLACE FUNCTION trida.fn_alertas(p_banco_codigo VARCHAR DEFAULT NULL)
RETURNS TABLE (
    id_alerta INTEGER, nivel_criticidad VARCHAR(10), fecha_generacion TIMESTAMPTZ,
    factores_sospechosos TEXT, estado_alerta VARCHAR(20), prioridad SMALLINT,
    cliente VARCHAR(150), id_transaccion INTEGER, monto NUMERIC(15,2),
    score_riesgo NUMERIC(5,1), tipo_transaccion VARCHAR(50), canal VARCHAR(20),
    estado_transaccion VARCHAR(20), banco VARCHAR(120), banco_codigo VARCHAR(50),
    banco_color VARCHAR(20), ciudad VARCHAR(100), dispositivo VARCHAR(50)
) LANGUAGE sql STABLE AS $$
    SELECT a.id_alerta, a.nivel_criticidad, a.fecha_generacion, a.factores_sospechosos,
           a.estado_alerta, a.prioridad, c.nombre_completo, t.id_transaccion, t.monto,
           t.score_riesgo, t.tipo_transaccion, t.canal, t.estado_transaccion,
           b.nombre, b.codigo, b.color, u.ciudad, d.tipo_dispositivo
    FROM trida.alertas a
    JOIN trida.transacciones t ON t.id_transaccion = a.id_transaccion
    JOIN trida.clientes c ON c.id_cliente = t.id_cliente
    JOIN trida.bancos b ON b.id_banco = t.id_banco
    JOIN trida.historico_de_ubicacion u ON u.id_ubicacion = t.id_ubicacion
    JOIN trida.dispositivos d ON d.id_dispositivo = t.id_dispositivo
    WHERE p_banco_codigo IS NULL OR b.codigo = p_banco_codigo
    ORDER BY a.fecha_generacion DESC;
$$;

CREATE OR REPLACE FUNCTION trida.fn_dispositivos(p_banco_codigo VARCHAR DEFAULT NULL)
RETURNS TABLE (
    id_dispositivo INTEGER, id_cliente INTEGER, tipo_dispositivo VARCHAR(50),
    identificador_unico VARCHAR(255), sistema_operativo VARCHAR(100),
    navegador VARCHAR(100), fecha_primer_uso TIMESTAMPTZ, fecha_ultimo_uso TIMESTAMPTZ,
    cliente VARCHAR(150), banco_codigo VARCHAR(50), banco VARCHAR(120), banco_color VARCHAR(20)
) LANGUAGE sql STABLE AS $$
    SELECT d.id_dispositivo, d.id_cliente, d.tipo_dispositivo, d.identificador_unico,
           d.sistema_operativo, d.navegador, d.fecha_primer_uso, d.fecha_ultimo_uso,
           c.nombre_completo, b.codigo, b.nombre, b.color
    FROM trida.dispositivos d
    JOIN trida.clientes c ON c.id_cliente = d.id_cliente
    JOIN trida.bancos b ON b.id_banco = c.id_banco
    WHERE p_banco_codigo IS NULL OR b.codigo = p_banco_codigo
    ORDER BY d.fecha_ultimo_uso DESC;
$$;

CREATE OR REPLACE FUNCTION trida.fn_usuarios(p_banco TEXT DEFAULT NULL)
RETURNS TABLE (
    id_cliente INTEGER, nombre_completo TEXT, email TEXT, telefono TEXT,
    fecha_registro TIMESTAMPTZ, estado BOOLEAN, pais TEXT, ciudad TEXT,
    banco_codigo TEXT, banco TEXT, banco_color TEXT
) LANGUAGE sql STABLE AS $$
    SELECT c.id_cliente, c.nombre_completo::TEXT, c.email::TEXT, c.telefono::TEXT,
           c.fecha_registro, c.estado, c.pais::TEXT, c.ciudad::TEXT,
           b.codigo::TEXT, b.nombre::TEXT, b.color::TEXT
    FROM trida.clientes c
    JOIN trida.bancos b ON b.id_banco = c.id_banco
    WHERE p_banco IS NULL OR b.codigo = p_banco
    ORDER BY c.fecha_registro DESC;
$$;

CREATE OR REPLACE FUNCTION trida.fn_bancos()
RETURNS TABLE (id_banco INTEGER, codigo VARCHAR(50), nombre VARCHAR(120), color VARCHAR(20))
LANGUAGE sql STABLE AS $$
    SELECT id_banco, codigo, nombre, color
    FROM trida.bancos WHERE estado = true ORDER BY nombre ASC;
$$;

-- ============================================================
-- FUNCIONES: Dashboard y Analytics
-- ============================================================

CREATE OR REPLACE FUNCTION trida.fn_dashboard_stats(p_banco_codigo VARCHAR DEFAULT NULL)
RETURNS TABLE (
    total BIGINT, fraude BIGINT, bloqueadas BIGINT, aprobadas BIGINT,
    pendientes BIGINT, monto_total NUMERIC, monto_promedio NUMERIC,
    riesgo_bajo BIGINT, riesgo_medio BIGINT, riesgo_alto BIGINT, riesgo_critico BIGINT
) LANGUAGE sql STABLE AS $$
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE t.estado_transaccion = 'ALERTADA'),
        COUNT(*) FILTER (WHERE t.estado_transaccion = 'BLOQUEADA'),
        COUNT(*) FILTER (WHERE t.estado_transaccion = 'APROBADA'),
        COUNT(*) FILTER (WHERE t.estado_transaccion = 'PENDIENTE'),
        COALESCE(SUM(t.monto), 0),
        COALESCE(AVG(t.monto), 0),
        COUNT(*) FILTER (WHERE t.score_riesgo < 25),
        COUNT(*) FILTER (WHERE t.score_riesgo >= 25 AND t.score_riesgo < 50),
        COUNT(*) FILTER (WHERE t.score_riesgo >= 50 AND t.score_riesgo < 75),
        COUNT(*) FILTER (WHERE t.score_riesgo >= 75)
    FROM trida.transacciones t
    WHERE p_banco_codigo IS NULL
    OR t.id_banco = (SELECT id_banco FROM trida.bancos WHERE codigo = p_banco_codigo);
$$;

CREATE OR REPLACE FUNCTION trida.fn_alertas_recientes(p_banco_codigo VARCHAR DEFAULT NULL)
RETURNS TABLE (
    id_alerta INTEGER, nivel_criticidad VARCHAR(10), fecha_generacion TIMESTAMPTZ,
    estado_alerta VARCHAR(20), cliente VARCHAR(150), monto NUMERIC(15,2),
    banco VARCHAR(120), banco_color VARCHAR(20)
) LANGUAGE sql STABLE AS $$
    SELECT a.id_alerta, a.nivel_criticidad, a.fecha_generacion, a.estado_alerta,
           c.nombre_completo, t.monto, b.nombre, b.color
    FROM trida.alertas a
    JOIN trida.transacciones t ON t.id_transaccion = a.id_transaccion
    JOIN trida.clientes c ON c.id_cliente = t.id_cliente
    JOIN trida.bancos b ON b.id_banco = t.id_banco
    WHERE a.estado_alerta = 'ACTIVA'
    AND (p_banco_codigo IS NULL OR b.codigo = p_banco_codigo)
    ORDER BY a.fecha_generacion DESC LIMIT 10;
$$;

CREATE OR REPLACE FUNCTION trida.fn_analytics_metricas(p_banco_codigo VARCHAR DEFAULT NULL)
RETURNS TABLE (
    total_analizadas BIGINT, monto_promedio NUMERIC,
    total_fraude BIGINT, falsos_positivos BIGINT
) LANGUAGE sql STABLE AS $$
    SELECT
        COUNT(*),
        COALESCE(AVG(t.monto), 0),
        COUNT(*) FILTER (WHERE t.estado_transaccion = 'ALERTADA'),
        (SELECT COUNT(*) FROM trida.validaciones v
         JOIN trida.alertas al ON al.id_alerta = v.id_alerta
         JOIN trida.transacciones tt ON tt.id_transaccion = al.id_transaccion
         WHERE v.clasificacion = 'FALSO_POSITIVO'
         AND (p_banco_codigo IS NULL
             OR tt.id_banco = (SELECT id_banco FROM trida.bancos WHERE codigo = p_banco_codigo)))
    FROM trida.transacciones t
    WHERE p_banco_codigo IS NULL
    OR t.id_banco = (SELECT id_banco FROM trida.bancos WHERE codigo = p_banco_codigo);
$$;

CREATE OR REPLACE FUNCTION trida.fn_analytics_por_tipo(p_banco_codigo VARCHAR DEFAULT NULL)
RETURNS TABLE (tipo_transaccion VARCHAR(50), total BIGINT)
LANGUAGE sql STABLE AS $$
    SELECT t.tipo_transaccion, COUNT(*) AS total
    FROM trida.transacciones t
    WHERE p_banco_codigo IS NULL
    OR t.id_banco = (SELECT id_banco FROM trida.bancos WHERE codigo = p_banco_codigo)
    GROUP BY t.tipo_transaccion ORDER BY total DESC;
$$;

CREATE OR REPLACE FUNCTION trida.fn_analytics_por_canal(p_banco_codigo VARCHAR DEFAULT NULL)
RETURNS TABLE (canal VARCHAR(20), total BIGINT)
LANGUAGE sql STABLE AS $$
    SELECT t.canal, COUNT(*) AS total
    FROM trida.transacciones t
    WHERE p_banco_codigo IS NULL
    OR t.id_banco = (SELECT id_banco FROM trida.bancos WHERE codigo = p_banco_codigo)
    GROUP BY t.canal ORDER BY total DESC;
$$;

CREATE OR REPLACE FUNCTION trida.fn_analytics_por_ciudad(p_banco_codigo VARCHAR DEFAULT NULL)
RETURNS TABLE (ciudad VARCHAR(100), total BIGINT)
LANGUAGE sql STABLE AS $$
    SELECT u.ciudad, COUNT(*) AS total
    FROM trida.transacciones t
    JOIN trida.historico_de_ubicacion u ON u.id_ubicacion = t.id_ubicacion
    WHERE p_banco_codigo IS NULL
    OR t.id_banco = (SELECT id_banco FROM trida.bancos WHERE codigo = p_banco_codigo)
    GROUP BY u.ciudad ORDER BY total DESC LIMIT 10;
$$;

-- ============================================================
-- FUNCIONES: Mapa
-- ============================================================

CREATE OR REPLACE FUNCTION trida.fn_mapa_stats(p_banco_codigo VARCHAR DEFAULT NULL)
RETURNS TABLE (total BIGINT, crit BIGINT, high BIGINT, app BIGINT, blk BIGINT)
LANGUAGE sql STABLE AS $$
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE t.score_riesgo >= 75),
        COUNT(*) FILTER (WHERE t.score_riesgo >= 50 AND t.score_riesgo < 75),
        COUNT(*) FILTER (WHERE t.estado_transaccion = 'APROBADA'),
        COUNT(*) FILTER (WHERE t.estado_transaccion = 'BLOQUEADA')
    FROM trida.transacciones t
    WHERE p_banco_codigo IS NULL
    OR t.id_banco = (SELECT id_banco FROM trida.bancos WHERE codigo = p_banco_codigo);
$$;

CREATE OR REPLACE FUNCTION trida.fn_mapa_ubicaciones(p_banco_codigo VARCHAR DEFAULT NULL)
RETURNS TABLE (
    id_transaccion INTEGER, latitud NUMERIC(9,6), longitud NUMERIC(9,6),
    ciudad VARCHAR(100), pais VARCHAR(100), monto NUMERIC(15,2),
    score_riesgo NUMERIC(5,1), estado_transaccion VARCHAR(20),
    tipo_transaccion VARCHAR(50), canal VARCHAR(20),
    fecha_transaccion TIMESTAMPTZ, cliente VARCHAR(150),
    banco VARCHAR(120), banco_color VARCHAR(20)
) LANGUAGE sql STABLE AS $$
    SELECT t.id_transaccion, h.latitud, h.longitud, h.ciudad, h.pais,
           t.monto, t.score_riesgo, t.estado_transaccion, t.tipo_transaccion,
           t.canal, t.fecha_transaccion, c.nombre_completo, b.nombre, b.color
    FROM trida.historico_de_ubicacion h
    JOIN trida.transacciones t ON t.id_ubicacion = h.id_ubicacion
    JOIN trida.clientes c ON c.id_cliente = t.id_cliente
    JOIN trida.bancos b ON b.id_banco = t.id_banco
    WHERE p_banco_codigo IS NULL
    OR t.id_banco = (SELECT id_banco FROM trida.bancos WHERE codigo = p_banco_codigo)
    ORDER BY t.fecha_transaccion DESC LIMIT 50;
$$;

-- ============================================================
-- FUNCIONES: Auth
-- ============================================================

CREATE OR REPLACE FUNCTION trida.fn_login(p_email TEXT)
RETURNS TABLE (
    id_usuario INTEGER, nombre_completo VARCHAR(150), email VARCHAR(254),
    password_hash TEXT, rol VARCHAR(30), estado BOOLEAN,
    fecha_creacion TIMESTAMPTZ, ultimo_acceso TIMESTAMPTZ
) LANGUAGE sql STABLE AS $$
    SELECT u.id_usuario, u.nombre_completo, u.email, u.password_hash,
           u.rol, u.estado, u.fecha_creacion, u.ultimo_acceso
    FROM trida.usuarios_sistemas u
    WHERE LOWER(u.email) = LOWER(p_email) LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION trida.fn_register(
    p_nombre_completo TEXT, p_email TEXT, p_password_hash TEXT,
    p_rol TEXT, p_id_generador INTEGER DEFAULT NULL
) RETURNS TABLE (
    id_usuario INTEGER, nombre_completo VARCHAR(150), email VARCHAR(254),
    rol VARCHAR(30), estado BOOLEAN, fecha_creacion TIMESTAMPTZ
) LANGUAGE plpgsql AS $$
DECLARE v_new_id INTEGER;
BEGIN
    INSERT INTO trida.usuarios_sistemas
        (nombre_completo, email, password_hash, rol, estado, fecha_creacion, id_usuario_generador)
    VALUES (p_nombre_completo, LOWER(p_email), p_password_hash, UPPER(p_rol), TRUE, NOW(), p_id_generador)
    RETURNING usuarios_sistemas.id_usuario INTO v_new_id;
    RETURN QUERY
    SELECT u.id_usuario, u.nombre_completo, u.email, u.rol, u.estado, u.fecha_creacion
    FROM trida.usuarios_sistemas u WHERE u.id_usuario = v_new_id;
END;
$$;

CREATE OR REPLACE FUNCTION trida.fn_usuario_actual(p_id_usuario INTEGER)
RETURNS TABLE (
    id_usuario INTEGER, nombre_completo VARCHAR(150), email VARCHAR(254),
    rol VARCHAR(30), estado BOOLEAN, fecha_creacion TIMESTAMPTZ, ultimo_acceso TIMESTAMPTZ
) LANGUAGE sql STABLE AS $$
    SELECT u.id_usuario, u.nombre_completo, u.email, u.rol,
           u.estado, u.fecha_creacion, u.ultimo_acceso
    FROM trida.usuarios_sistemas u WHERE u.id_usuario = p_id_usuario LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION trida.fn_actualizar_ultimo_acceso(p_id_usuario INTEGER)
RETURNS VOID LANGUAGE sql AS $$
    UPDATE trida.usuarios_sistemas SET ultimo_acceso = NOW() WHERE id_usuario = p_id_usuario;
$$;

CREATE OR REPLACE FUNCTION trida.fn_listar_usuarios_sistema()
RETURNS TABLE (
    id_usuario INTEGER, nombre_completo VARCHAR(150), email VARCHAR(254),
    rol VARCHAR(30), estado BOOLEAN, fecha_creacion TIMESTAMPTZ,
    ultimo_acceso TIMESTAMPTZ, id_usuario_generador INTEGER
) LANGUAGE sql STABLE AS $$
    SELECT u.id_usuario, u.nombre_completo, u.email, u.rol,
           u.estado, u.fecha_creacion, u.ultimo_acceso, u.id_usuario_generador
    FROM trida.usuarios_sistemas u ORDER BY u.fecha_creacion DESC;
$$;

-- ============================================================
-- FUNCIÓN EXTRA: Cambiar contraseña (la llama el backend)
-- ============================================================
CREATE OR REPLACE FUNCTION trida.fn_cambiar_contrasena(
    p_id_usuario INTEGER, p_new_hash TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
    UPDATE trida.usuarios_sistemas
    SET password_hash = p_new_hash
    WHERE id_usuario = p_id_usuario;
    RETURN FOUND;
END;
$$;


