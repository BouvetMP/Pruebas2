    SET search_path TO trida, public;

    -- =============================================================
    -- 1. fn_clientes  (sin filtro, solo lista cruda)
    -- =============================================================
    DROP FUNCTION IF EXISTS trida.fn_clientes();

    CREATE FUNCTION trida.fn_clientes()
    RETURNS TABLE (
        id_cliente      INTEGER,
        id_banco        INTEGER,
        nombre_completo VARCHAR(150),
        email           VARCHAR(254),
        telefono        VARCHAR(20),
        fecha_registro  TIMESTAMPTZ,
        estado          BOOLEAN,
        pais            VARCHAR(100),
        ciudad          VARCHAR(100)
    )
    LANGUAGE sql
    STABLE
    AS $$
        SELECT
            c.id_cliente, c.id_banco, c.nombre_completo, c.email,
            c.telefono, c.fecha_registro, c.estado, c.pais, c.ciudad
        FROM trida.clientes c
        ORDER BY c.id_cliente ASC;
    $$;


    -- =============================================================
    -- 2. fn_transacciones  (filtro por banco)
    -- =============================================================
    DROP FUNCTION IF EXISTS trida.fn_transacciones(VARCHAR);
    DROP FUNCTION IF EXISTS trida.fn_transacciones(TEXT);

    CREATE FUNCTION trida.fn_transacciones(p_banco_codigo VARCHAR DEFAULT NULL)
    RETURNS TABLE (
        id_transaccion     INTEGER,
        fecha_transaccion  TIMESTAMPTZ,
        cliente            VARCHAR(150),
        banco              VARCHAR(120),
        banco_codigo       VARCHAR(50),
        banco_color        VARCHAR(20),
        tipo_transaccion   VARCHAR(50),
        monto              NUMERIC(15, 2),
        score_riesgo       NUMERIC(5, 1),
        estado_transaccion VARCHAR(20),
        canal              VARCHAR(20),
        ciudad             VARCHAR(100),
        pais               VARCHAR(100)
    )
    LANGUAGE sql
    STABLE
    AS $$
        SELECT
            t.id_transaccion,
            t.fecha_transaccion,
            c.nombre_completo AS cliente,
            b.nombre  AS banco,
            b.codigo  AS banco_codigo,
            b.color   AS banco_color,
            t.tipo_transaccion,
            t.monto,
            t.score_riesgo,
            t.estado_transaccion,
            t.canal,
            u.ciudad,
            u.pais
        FROM trida.transacciones t
        JOIN trida.clientes c               ON c.id_cliente   = t.id_cliente
        JOIN trida.bancos b                 ON b.id_banco     = t.id_banco
        JOIN trida.historico_de_ubicacion u ON u.id_ubicacion = t.id_ubicacion
        WHERE p_banco_codigo IS NULL OR b.codigo = p_banco_codigo
        ORDER BY t.fecha_transaccion DESC
        LIMIT 500;
    $$;


    -- =============================================================
    -- 3. fn_alertas  (filtro por banco + ciudad + dispositivo)
    -- =============================================================
    DROP FUNCTION IF EXISTS trida.fn_alertas();
    DROP FUNCTION IF EXISTS trida.fn_alertas(VARCHAR);
    DROP FUNCTION IF EXISTS trida.fn_alertas(TEXT);

    CREATE FUNCTION trida.fn_alertas(p_banco_codigo VARCHAR DEFAULT NULL)
    RETURNS TABLE (
        id_alerta            INTEGER,
        nivel_criticidad     VARCHAR(10),
        fecha_generacion     TIMESTAMPTZ,
        factores_sospechosos TEXT,
        estado_alerta        VARCHAR(20),
        prioridad            SMALLINT,
        cliente              VARCHAR(150),
        id_transaccion       INTEGER,
        monto                NUMERIC(15, 2),
        score_riesgo         NUMERIC(5, 1),
        tipo_transaccion     VARCHAR(50),
        canal                VARCHAR(20),
        estado_transaccion   VARCHAR(20),
        banco                VARCHAR(120),
        banco_codigo         VARCHAR(50),
        banco_color          VARCHAR(20),
        ciudad               VARCHAR(100),
        dispositivo          VARCHAR(50)
    )
    LANGUAGE sql
    STABLE
    AS $$
        SELECT
            a.id_alerta,
            a.nivel_criticidad,
            a.fecha_generacion,
            a.factores_sospechosos,
            a.estado_alerta,
            a.prioridad,
            c.nombre_completo AS cliente,
            t.id_transaccion,
            t.monto,
            t.score_riesgo,
            t.tipo_transaccion,
            t.canal,
            t.estado_transaccion,
            b.nombre  AS banco,
            b.codigo  AS banco_codigo,
            b.color   AS banco_color,
            u.ciudad,
            d.tipo_dispositivo AS dispositivo
        FROM trida.alertas a
        JOIN trida.transacciones t          ON t.id_transaccion = a.id_transaccion
        JOIN trida.clientes c               ON c.id_cliente     = t.id_cliente
        JOIN trida.bancos b                 ON b.id_banco       = t.id_banco
        JOIN trida.historico_de_ubicacion u ON u.id_ubicacion   = t.id_ubicacion
        JOIN trida.dispositivos d           ON d.id_dispositivo = t.id_dispositivo
        WHERE p_banco_codigo IS NULL OR b.codigo = p_banco_codigo
        ORDER BY a.fecha_generacion DESC;
    $$;


    -- =============================================================
    -- 4. fn_dispositivos  (filtro por banco)
    -- =============================================================
    DROP FUNCTION IF EXISTS trida.fn_dispositivos();
    DROP FUNCTION IF EXISTS trida.fn_dispositivos(VARCHAR);
    DROP FUNCTION IF EXISTS trida.fn_dispositivos(TEXT);

    CREATE FUNCTION trida.fn_dispositivos(p_banco_codigo VARCHAR DEFAULT NULL)
    RETURNS TABLE (
        id_dispositivo      INTEGER,
        id_cliente          INTEGER,
        tipo_dispositivo    VARCHAR(50),
        identificador_unico VARCHAR(255),
        sistema_operativo   VARCHAR(100),
        navegador           VARCHAR(100),
        fecha_primer_uso    TIMESTAMPTZ,
        fecha_ultimo_uso    TIMESTAMPTZ,
        cliente             VARCHAR(150),
        banco_codigo        VARCHAR(50),
        banco               VARCHAR(120),
        banco_color         VARCHAR(20)
    )
    LANGUAGE sql
    STABLE
    AS $$
        SELECT
            d.id_dispositivo,
            d.id_cliente,
            d.tipo_dispositivo,
            d.identificador_unico,
            d.sistema_operativo,
            d.navegador,
            d.fecha_primer_uso,
            d.fecha_ultimo_uso,
            c.nombre_completo AS cliente,
            b.codigo AS banco_codigo,
            b.nombre AS banco,
            b.color  AS banco_color
        FROM trida.dispositivos d
        JOIN trida.clientes c ON c.id_cliente = d.id_cliente
        JOIN trida.bancos b   ON b.id_banco   = c.id_banco
        WHERE p_banco_codigo IS NULL OR b.codigo = p_banco_codigo
        ORDER BY d.fecha_ultimo_uso DESC;
    $$;


    -- =============================================================
    -- 5. fn_usuarios  (clientes + banco, filtro por banco)
    -- =============================================================
    DROP FUNCTION IF EXISTS trida.fn_usuarios();
    DROP FUNCTION IF EXISTS trida.fn_usuarios(VARCHAR);
    DROP FUNCTION IF EXISTS trida.fn_usuarios(TEXT);

    CREATE FUNCTION trida.fn_usuarios(p_banco TEXT DEFAULT NULL)
    RETURNS TABLE (
        id_cliente       INTEGER,
        nombre_completo  TEXT,
        email            TEXT,
        telefono         TEXT,
        fecha_registro   TIMESTAMPTZ,
        estado           BOOLEAN,
        pais             TEXT,
        ciudad           TEXT,
        banco_codigo     TEXT,
        banco            TEXT,
        banco_color      TEXT
    )
    LANGUAGE sql
    STABLE
    AS $$
        SELECT
            c.id_cliente,
            c.nombre_completo::TEXT,
            c.email::TEXT,
            c.telefono::TEXT,
            c.fecha_registro,
            c.estado,
            c.pais::TEXT,
            c.ciudad::TEXT,
            b.codigo::TEXT  AS banco_codigo,
            b.nombre::TEXT  AS banco,
            b.color::TEXT   AS banco_color
        FROM trida.clientes c
        JOIN trida.bancos b ON b.id_banco = c.id_banco
        WHERE p_banco IS NULL OR b.codigo = p_banco
        ORDER BY c.fecha_registro DESC;
    $$;


    -- =============================================================
    -- 6. fn_dashboard_stats  (filtro por banco)
    -- =============================================================
    DROP FUNCTION IF EXISTS trida.fn_dashboard_stats(VARCHAR);
    DROP FUNCTION IF EXISTS trida.fn_dashboard_stats(TEXT);

    CREATE FUNCTION trida.fn_dashboard_stats(p_banco_codigo VARCHAR DEFAULT NULL)
    RETURNS TABLE (
        total          BIGINT,
        fraude         BIGINT,
        bloqueadas     BIGINT,
        aprobadas      BIGINT,
        pendientes     BIGINT,
        monto_total    NUMERIC,
        monto_promedio NUMERIC,
        riesgo_bajo    BIGINT,
        riesgo_medio   BIGINT,
        riesgo_alto    BIGINT,
        riesgo_critico BIGINT
    )
    LANGUAGE sql
    STABLE
    AS $$
        SELECT
            COUNT(*)                                                            AS total,
            COUNT(*) FILTER (WHERE t.estado_transaccion = 'ALERTADA')           AS fraude,
            COUNT(*) FILTER (WHERE t.estado_transaccion = 'BLOQUEADA')          AS bloqueadas,
            COUNT(*) FILTER (WHERE t.estado_transaccion = 'APROBADA')           AS aprobadas,
            COUNT(*) FILTER (WHERE t.estado_transaccion = 'PENDIENTE')          AS pendientes,
            COALESCE(SUM(t.monto), 0)                                           AS monto_total,
            COALESCE(AVG(t.monto), 0)                                           AS monto_promedio,
            COUNT(*) FILTER (WHERE t.score_riesgo < 25)                         AS riesgo_bajo,
            COUNT(*) FILTER (WHERE t.score_riesgo >= 25 AND t.score_riesgo < 50) AS riesgo_medio,
            COUNT(*) FILTER (WHERE t.score_riesgo >= 50 AND t.score_riesgo < 75) AS riesgo_alto,
            COUNT(*) FILTER (WHERE t.score_riesgo >= 75)                        AS riesgo_critico
        FROM trida.transacciones t
        WHERE p_banco_codigo IS NULL
        OR t.id_banco = (SELECT id_banco FROM trida.bancos WHERE codigo = p_banco_codigo);
    $$;


    -- =============================================================
    -- 7. fn_alertas_recientes  (10 últimas activas, filtro por banco)
    -- =============================================================
    DROP FUNCTION IF EXISTS trida.fn_alertas_recientes(VARCHAR);
    DROP FUNCTION IF EXISTS trida.fn_alertas_recientes(TEXT);

    CREATE FUNCTION trida.fn_alertas_recientes(p_banco_codigo VARCHAR DEFAULT NULL)
    RETURNS TABLE (
        id_alerta        INTEGER,
        nivel_criticidad VARCHAR(10),
        fecha_generacion TIMESTAMPTZ,
        estado_alerta    VARCHAR(20),
        cliente          VARCHAR(150),
        monto            NUMERIC(15, 2),
        banco            VARCHAR(120),
        banco_color      VARCHAR(20)
    )
    LANGUAGE sql
    STABLE
    AS $$
        SELECT
            a.id_alerta,
            a.nivel_criticidad,
            a.fecha_generacion,
            a.estado_alerta,
            c.nombre_completo AS cliente,
            t.monto,
            b.nombre AS banco,
            b.color  AS banco_color
        FROM trida.alertas a
        JOIN trida.transacciones t ON t.id_transaccion = a.id_transaccion
        JOIN trida.clientes c      ON c.id_cliente     = t.id_cliente
        JOIN trida.bancos b        ON b.id_banco       = t.id_banco
        WHERE a.estado_alerta = 'ACTIVA'
        AND (p_banco_codigo IS NULL OR b.codigo = p_banco_codigo)
        ORDER BY a.fecha_generacion DESC
        LIMIT 10;
    $$;


    -- =============================================================
    -- 8. fn_analytics_metricas  (filtro por banco)
    -- =============================================================
    DROP FUNCTION IF EXISTS trida.fn_analytics_metricas(VARCHAR);
    DROP FUNCTION IF EXISTS trida.fn_analytics_metricas(TEXT);

    CREATE FUNCTION trida.fn_analytics_metricas(p_banco_codigo VARCHAR DEFAULT NULL)
    RETURNS TABLE (
        total_analizadas BIGINT,
        monto_promedio   NUMERIC,
        total_fraude     BIGINT,
        falsos_positivos BIGINT
    )
    LANGUAGE sql
    STABLE
    AS $$
        SELECT
            COUNT(*) AS total_analizadas,
            COALESCE(AVG(t.monto), 0) AS monto_promedio,
            COUNT(*) FILTER (WHERE t.estado_transaccion = 'ALERTADA') AS total_fraude,
            (
                SELECT COUNT(*)
                FROM trida.validaciones v
                JOIN trida.alertas al      ON al.id_alerta      = v.id_alerta
                JOIN trida.transacciones tt ON tt.id_transaccion = al.id_transaccion
                WHERE v.clasificacion = 'FALSO_POSITIVO'
                AND (p_banco_codigo IS NULL
                    OR tt.id_banco = (SELECT id_banco FROM trida.bancos WHERE codigo = p_banco_codigo))
            ) AS falsos_positivos
        FROM trida.transacciones t
        WHERE p_banco_codigo IS NULL
        OR t.id_banco = (SELECT id_banco FROM trida.bancos WHERE codigo = p_banco_codigo);
    $$;


    -- =============================================================
    -- 9. fn_analytics_por_tipo  (filtro por banco)
    -- =============================================================
    DROP FUNCTION IF EXISTS trida.fn_analytics_por_tipo(VARCHAR);
    DROP FUNCTION IF EXISTS trida.fn_analytics_por_tipo(TEXT);

    CREATE FUNCTION trida.fn_analytics_por_tipo(p_banco_codigo VARCHAR DEFAULT NULL)
    RETURNS TABLE (
        tipo_transaccion VARCHAR(50),
        total            BIGINT
    )
    LANGUAGE sql
    STABLE
    AS $$
        SELECT t.tipo_transaccion, COUNT(*) AS total
        FROM trida.transacciones t
        WHERE p_banco_codigo IS NULL
        OR t.id_banco = (SELECT id_banco FROM trida.bancos WHERE codigo = p_banco_codigo)
        GROUP BY t.tipo_transaccion
        ORDER BY total DESC;
    $$;


    -- =============================================================
    -- 10. fn_analytics_por_ciudad  (filtro por banco)
    -- =============================================================
    DROP FUNCTION IF EXISTS trida.fn_analytics_por_ciudad(VARCHAR);
    DROP FUNCTION IF EXISTS trida.fn_analytics_por_ciudad(TEXT);

    CREATE FUNCTION trida.fn_analytics_por_ciudad(p_banco_codigo VARCHAR DEFAULT NULL)
    RETURNS TABLE (
        ciudad VARCHAR(100),
        total  BIGINT
    )
    LANGUAGE sql
    STABLE
    AS $$
        SELECT u.ciudad, COUNT(*) AS total
        FROM trida.transacciones t
        JOIN trida.historico_de_ubicacion u ON u.id_ubicacion = t.id_ubicacion
        WHERE p_banco_codigo IS NULL
        OR t.id_banco = (SELECT id_banco FROM trida.bancos WHERE codigo = p_banco_codigo)
        GROUP BY u.ciudad
        ORDER BY total DESC
        LIMIT 10;
    $$;


    -- =============================================================
    -- 11. fn_analytics_por_canal  (filtro por banco)
    -- =============================================================
    DROP FUNCTION IF EXISTS trida.fn_analytics_por_canal(VARCHAR);
    DROP FUNCTION IF EXISTS trida.fn_analytics_por_canal(TEXT);

    CREATE FUNCTION trida.fn_analytics_por_canal(p_banco_codigo VARCHAR DEFAULT NULL)
    RETURNS TABLE (
        canal VARCHAR(20),
        total BIGINT
    )
    LANGUAGE sql
    STABLE
    AS $$
        SELECT t.canal, COUNT(*) AS total
        FROM trida.transacciones t
        WHERE p_banco_codigo IS NULL
        OR t.id_banco = (SELECT id_banco FROM trida.bancos WHERE codigo = p_banco_codigo)
        GROUP BY t.canal
        ORDER BY total DESC;
    $$;


    -- =============================================================
    -- 12. fn_analytics_por_banco_fraude  (filtro por banco)
    -- =============================================================
    DROP FUNCTION IF EXISTS trida.fn_analytics_por_banco_fraude(VARCHAR);
    DROP FUNCTION IF EXISTS trida.fn_analytics_por_banco_fraude(TEXT);

    CREATE FUNCTION trida.fn_analytics_por_banco_fraude(p_banco_codigo VARCHAR DEFAULT NULL)
    RETURNS TABLE (
        banco         VARCHAR(120),
        banco_color   VARCHAR(20),
        total_fraude  BIGINT
    )
    LANGUAGE sql
    STABLE
    AS $$
        SELECT b.nombre AS banco, b.color AS banco_color, COUNT(*) AS total_fraude
        FROM trida.transacciones t
        JOIN trida.bancos b ON b.id_banco = t.id_banco
        WHERE t.estado_transaccion = 'ALERTADA'
        AND (p_banco_codigo IS NULL
            OR t.id_banco = (SELECT id_banco FROM trida.bancos WHERE codigo = p_banco_codigo))
        GROUP BY b.nombre, b.color
        ORDER BY total_fraude DESC;
    $$;


    -- =============================================================
    -- 13. fn_mapa_stats  (filtro por banco)
    -- =============================================================
    DROP FUNCTION IF EXISTS trida.fn_mapa_stats(VARCHAR);
    DROP FUNCTION IF EXISTS trida.fn_mapa_stats(TEXT);

    CREATE FUNCTION trida.fn_mapa_stats(p_banco_codigo VARCHAR DEFAULT NULL)
    RETURNS TABLE (
        total BIGINT,
        crit  BIGINT,
        high  BIGINT,
        app   BIGINT,
        blk   BIGINT
    )
    LANGUAGE sql
    STABLE
    AS $$
        SELECT
            COUNT(*)                                                               AS total,
            COUNT(*) FILTER (WHERE t.score_riesgo >= 75)                           AS crit,
            COUNT(*) FILTER (WHERE t.score_riesgo >= 50 AND t.score_riesgo < 75)   AS high,
            COUNT(*) FILTER (WHERE t.estado_transaccion = 'APROBADA')              AS app,
            COUNT(*) FILTER (WHERE t.estado_transaccion = 'BLOQUEADA')             AS blk
        FROM trida.transacciones t
        WHERE p_banco_codigo IS NULL
        OR t.id_banco = (SELECT id_banco FROM trida.bancos WHERE codigo = p_banco_codigo);
    $$;


    -- =============================================================
    -- 14. fn_mapa_ubicaciones  (filtro por banco)
    -- =============================================================
    DROP FUNCTION IF EXISTS trida.fn_mapa_ubicaciones(VARCHAR);
    DROP FUNCTION IF EXISTS trida.fn_mapa_ubicaciones(TEXT);

    CREATE FUNCTION trida.fn_mapa_ubicaciones(p_banco_codigo VARCHAR DEFAULT NULL)
    RETURNS TABLE (
        id_transaccion     INTEGER,
        latitud            NUMERIC(9, 6),
        longitud           NUMERIC(9, 6),
        ciudad             VARCHAR(100),
        pais               VARCHAR(100),
        monto              NUMERIC(15, 2),
        score_riesgo       NUMERIC(5, 1),
        estado_transaccion VARCHAR(20),
        tipo_transaccion   VARCHAR(50),
        canal              VARCHAR(20),
        fecha_transaccion  TIMESTAMPTZ,
        cliente            VARCHAR(150),
        banco              VARCHAR(120),
        banco_color        VARCHAR(20)
    )
    LANGUAGE sql
    STABLE
    AS $$
        SELECT
            t.id_transaccion,
            h.latitud,
            h.longitud,
            h.ciudad,
            h.pais,
            t.monto,
            t.score_riesgo,
            t.estado_transaccion,
            t.tipo_transaccion,
            t.canal,
            t.fecha_transaccion,
            c.nombre_completo AS cliente,
            b.nombre AS banco,
            b.color  AS banco_color
        FROM trida.historico_de_ubicacion h
        JOIN trida.transacciones t ON t.id_ubicacion = h.id_ubicacion
        JOIN trida.clientes c      ON c.id_cliente   = t.id_cliente
        JOIN trida.bancos b        ON b.id_banco     = t.id_banco
        WHERE p_banco_codigo IS NULL
        OR t.id_banco = (SELECT id_banco FROM trida.bancos WHERE codigo = p_banco_codigo)
        ORDER BY t.fecha_transaccion DESC
        LIMIT 50;
    $$;


    -- =============================================================
    -- 15. fn_bancos  (catálogo)
    -- =============================================================
    DROP FUNCTION IF EXISTS trida.fn_bancos();

    CREATE FUNCTION trida.fn_bancos()
    RETURNS TABLE (
        id_banco INTEGER,
        codigo   VARCHAR(50),
        nombre   VARCHAR(120),
        color    VARCHAR(20)
    )
    LANGUAGE sql
    STABLE
    AS $$
        SELECT id_banco, codigo, nombre, color
        FROM trida.bancos
        WHERE estado = true
        ORDER BY nombre ASC;
    $$;

    SET search_path TO trida, public;

    -- ════════════════════════════════════════════════════════════
    -- 1. fn_login: buscar usuario por email
    -- ════════════════════════════════════════════════════════════
    DROP FUNCTION IF EXISTS trida.fn_login(VARCHAR);
    DROP FUNCTION IF EXISTS trida.fn_login(TEXT);

    CREATE FUNCTION trida.fn_login(p_email TEXT)
    RETURNS TABLE (
        id_usuario      INTEGER,
        nombre_completo VARCHAR(150),
        email           VARCHAR(254),
        password_hash   TEXT,
        rol             VARCHAR(30),
        estado          BOOLEAN,
        fecha_creacion  TIMESTAMPTZ,
        ultimo_acceso   TIMESTAMPTZ
    )
    LANGUAGE sql
    STABLE
    AS $$
        SELECT
            u.id_usuario,
            u.nombre_completo,
            u.email,
            u.password_hash,
            u.rol,
            u.estado,
            u.fecha_creacion,
            u.ultimo_acceso
        FROM trida.usuarios_sistemas u
        WHERE LOWER(u.email) = LOWER(p_email)
        LIMIT 1;
    $$;


    -- ════════════════════════════════════════════════════════════
    -- 2. fn_register: crear nuevo usuario del sistema
    -- ════════════════════════════════════════════════════════════
    DROP FUNCTION IF EXISTS trida.fn_register(TEXT, TEXT, TEXT, TEXT, INTEGER);
    DROP FUNCTION IF EXISTS trida.fn_register(VARCHAR, VARCHAR, TEXT, VARCHAR, INTEGER);

    CREATE FUNCTION trida.fn_register(
        p_nombre_completo TEXT,
        p_email           TEXT,
        p_password_hash   TEXT,
        p_rol             TEXT,
        p_id_generador    INTEGER DEFAULT NULL
    )
    RETURNS TABLE (
        id_usuario      INTEGER,
        nombre_completo VARCHAR(150),
        email           VARCHAR(254),
        rol             VARCHAR(30),
        estado          BOOLEAN,
        fecha_creacion  TIMESTAMPTZ
    )
    LANGUAGE plpgsql
    AS $$
    DECLARE
        v_new_id INTEGER;
    BEGIN
        INSERT INTO trida.usuarios_sistemas (
            nombre_completo, email, password_hash, rol,
            estado, fecha_creacion, id_usuario_generador
        )
        VALUES (
            p_nombre_completo,
            LOWER(p_email),
            p_password_hash,
            UPPER(p_rol),
            TRUE,
            NOW(),
            p_id_generador
        )
        RETURNING usuarios_sistemas.id_usuario INTO v_new_id;

        RETURN QUERY
        SELECT
            u.id_usuario,
            u.nombre_completo,
            u.email,
            u.rol,
            u.estado,
            u.fecha_creacion
        FROM trida.usuarios_sistemas u
        WHERE u.id_usuario = v_new_id;
    END;
    $$;


    -- ════════════════════════════════════════════════════════════
    -- 3. fn_usuario_actual: obtener datos del usuario logueado
    -- ════════════════════════════════════════════════════════════
    DROP FUNCTION IF EXISTS trida.fn_usuario_actual(INTEGER);

    CREATE FUNCTION trida.fn_usuario_actual(p_id_usuario INTEGER)
    RETURNS TABLE (
        id_usuario      INTEGER,
        nombre_completo VARCHAR(150),
        email           VARCHAR(254),
        rol             VARCHAR(30),
        estado          BOOLEAN,
        fecha_creacion  TIMESTAMPTZ,
        ultimo_acceso   TIMESTAMPTZ
    )
    LANGUAGE sql
    STABLE
    AS $$
        SELECT
            u.id_usuario,
            u.nombre_completo,
            u.email,
            u.rol,
            u.estado,
            u.fecha_creacion,
            u.ultimo_acceso
        FROM trida.usuarios_sistemas u
        WHERE u.id_usuario = p_id_usuario
        LIMIT 1;
    $$;


    -- ════════════════════════════════════════════════════════════
    -- 4. fn_actualizar_ultimo_acceso: marcar el último login
    -- ════════════════════════════════════════════════════════════
    DROP FUNCTION IF EXISTS trida.fn_actualizar_ultimo_acceso(INTEGER);

    CREATE FUNCTION trida.fn_actualizar_ultimo_acceso(p_id_usuario INTEGER)
    RETURNS VOID
    LANGUAGE sql
    AS $$
        UPDATE trida.usuarios_sistemas
        SET ultimo_acceso = NOW()
        WHERE id_usuario = p_id_usuario;
    $$;


    -- ════════════════════════════════════════════════════════════
    -- 5. fn_listar_usuarios_sistema: listar todos (para admin)
    -- ════════════════════════════════════════════════════════════
    DROP FUNCTION IF EXISTS trida.fn_listar_usuarios_sistema();

    CREATE FUNCTION trida.fn_listar_usuarios_sistema()
    RETURNS TABLE (
        id_usuario           INTEGER,
        nombre_completo      VARCHAR(150),
        email                VARCHAR(254),
        rol                  VARCHAR(30),
        estado               BOOLEAN,
        fecha_creacion       TIMESTAMPTZ,
        ultimo_acceso        TIMESTAMPTZ,
        id_usuario_generador INTEGER
    )
    LANGUAGE sql
    STABLE
    AS $$
        SELECT
            u.id_usuario,
            u.nombre_completo,
            u.email,
            u.rol,
            u.estado,
            u.fecha_creacion,
            u.ultimo_acceso,
            u.id_usuario_generador
        FROM trida.usuarios_sistemas u
        ORDER BY u.fecha_creacion DESC;
    $$;

    SELECT * FROM trida.fn_register(
        'Usuario de Prueba',
        'prueba@trida.co',
        '$2a$12$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJ',
        'OPERADOR',
        1
    );

    DELETE FROM trida.usuarios_sistemas WHERE email = 'prueba@trida.co';