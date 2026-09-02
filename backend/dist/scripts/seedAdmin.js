"use strict";
// ¿Qué? Script de siembra para la creación segura del usuario administrador inicial.
// ¿Para qué? Crear el usuario admin leyendo credenciales de .env o argumentos de consola.
// ¿Impacto? Resuelve P1-7 y P1-1 eliminando contraseñas y secretos hardcodeados en el código.
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../db/prisma");
const password_util_1 = require("../utils/password.util");
async function seedAdmin() {
    // P1-7: Leer credenciales de argumentos de consola o del .env (con fallback seguro)
    const email = process.argv[2] || process.env.ADMIN_EMAIL || 'admin@trida.com';
    const password = process.argv[3] || process.env.ADMIN_PASSWORD || 'Admin123456!';
    const nombre = process.env.ADMIN_NAME || 'Administrador Principal';
    console.log('⏳ Verificando / creando usuario administrador inicial...');
    try {
        // 1. Verificar si ya existe el usuario
        const adminExistente = await prisma_1.prisma.usuarioSistema.findUnique({
            where: { email },
        });
        if (adminExistente) {
            console.log(`⚠️ El usuario admin <${email}> ya existe en la base de datos.`);
            process.exit(0);
        }
        // 2. Hashear la contraseña con bcryptjs (coste 12)
        const passwordHash = await (0, password_util_1.hashPassword)(password);
        // 3. Crear el administrador en PostgreSQL
        const nuevoAdmin = await prisma_1.prisma.usuarioSistema.create({
            data: {
                nombre_completo: nombre,
                email,
                password_hash: passwordHash,
                rol: 'ADMINISTRADOR',
                estado: true,
            },
            select: {
                id_usuario: true,
                nombre_completo: true,
                email: true,
                rol: true,
                fecha_creacion: true,
            },
        });
        console.log('\n✅ Administrador creado exitosamente con credenciales seguras:');
        console.log('----------------------------------------------------');
        console.log(` ID:       ${nuevoAdmin.id_usuario}`);
        console.log(` Nombre:   ${nuevoAdmin.nombre_completo}`);
        console.log(` Email:    ${nuevoAdmin.email}`);
        console.log(` Rol:      ${nuevoAdmin.rol}`);
        console.log('----------------------------------------------------');
        console.log('🔑 Credenciales para iniciar sesión:');
        console.log(`   Email:    ${email}`);
        console.log(`   Password: ${password}`);
        console.log('----------------------------------------------------\n');
    }
    catch (error) {
        console.error('❌ Error ejecutando la siembra del administrador:', error);
    }
    finally {
        await prisma_1.prisma.$disconnect();
    }
}
seedAdmin();
//# sourceMappingURL=seedAdmin.js.map