// ¿Qué? Servicio de consulta y creación de transacciones con evaluación de riesgo en tiempo real.
// ¿Para qué? Procesar operaciones financieras alimentando el motor de 7 factores con el perfil dinámico real del cliente.
// ¿Impacto? Elimina valores hardcodeados del score de riesgo, garantizando precisión según el historial transaccional de cada cliente.

import { prisma } from '../../db/prisma.js';
import { riskScoringEngine, type RiskInput } from './risk.service.js';

export const transactionsService = {
  /**
   * Obtiene el listado de transacciones llamando a la función SQL fn_transacciones.
   */
  async list(bancoCodigo?: string | null) {
    return prisma.$queryRaw<any[]>`SELECT * FROM trida.fn_transacciones(${bancoCodigo ?? null})`;
  },

  /**
   * Procesa y registra una nueva transacción evaluando su nivel de riesgo con datos dinámicos del cliente.
   */
  async create(data: any) {
    const fechaTx = new Date();

    // 1. Consultar contexto en paralelo: cliente, dispositivo, ubicación, alertas y perfil histórico SQL
    const [dispositivo, ubicacion, cliente, historialAlertas, perfilRaw, ultimaTx] = await Promise.all([
      prisma.dispositivo.findUnique({ where: { id_dispositivo: data.id_dispositivo } }),
      prisma.historicoUbicacion.findUnique({ where: { id_ubicacion: data.id_ubicacion } }),
      prisma.cliente.findUnique({ where: { id_cliente: data.id_cliente } }),
      prisma.alerta.count({ where: { transaccion: { id_cliente: data.id_cliente } } }),
      prisma.$queryRaw<any[]>`SELECT * FROM trida.fn_perfil_cliente(${data.id_cliente})`,
      prisma.transaccion.findFirst({
        where: { id_cliente: data.id_cliente },
        orderBy: { fecha_transaccion: 'desc' },
      }),
    ]);

    // 2. Extraer métricas del perfil histórico devuelto por fn_perfil_cliente
    const perfil = perfilRaw[0] || null;
    const totalTxHistoricas = Number(perfil?.total_transacciones ?? 0);
    const montoPromedioReal = Number(perfil?.monto_promedio ?? 0);
    const desviacionReal = Number(perfil?.desviacion_estandar ?? 0);
    const ciudadHabitual = perfil?.ciudad_habitual || cliente?.ciudad || 'Bogotá';
    const paisHabitual = perfil?.pais_habitual || cliente?.pais || 'Colombia';

    // 3. Aplicar fallback dinámico si el cliente tiene pocos registros (< 3)
    const tieneSuficienteHistorial = totalTxHistoricas >= 3 && montoPromedioReal > 0;
    const montoPromedio = tieneSuficienteHistorial ? montoPromedioReal : 350000;
    const desviacionEstandar = tieneSuficienteHistorial
      ? (desviacionReal > 0 ? desviacionReal : montoPromedioReal * 0.35)
      : 180000;

    // 4. Calcular distancia dinámica según ciudad y país habitual vs actual
    const ciudadActual = ubicacion?.ciudad ?? 'Bogotá';
    const paisActual = ubicacion?.pais ?? 'Colombia';

    let distanciaKm = 10; // Distancia base (misma ciudad)
    if (paisActual !== paisHabitual) {
      distanciaKm = 2800; // Operación internacional atípica
    } else if (ciudadActual !== ciudadHabitual) {
      distanciaKm = 480; // Cambio de ciudad nacional
    }

    // 5. Calcular tiempo transcurrido desde la última transacción
    let tiempoTranscurridoHoras = 24; // Por defecto 1 día si es la primera
    if (ultimaTx) {
      const diffMs = fechaTx.getTime() - new Date(ultimaTx.fecha_transaccion).getTime();
      tiempoTranscurridoHoras = Math.max(0.05, diffMs / (1000 * 60 * 60)); // Mínimo ~3 minutos
    }

    // 6. Configurar la entrada para la Fórmula de Criticidad (F1 - F7)
    const riskInput: RiskInput = {
      montoActual: Number(data.monto),
      montoPromedio,
      desviacionEstandar,

      dispositivoConocido: !!dispositivo,
      dispositivoConfiable: dispositivo ? dispositivo.tipo_dispositivo !== 'DESCONOCIDO' : false,
      diasUsoDispositivo: dispositivo
        ? Math.max(0, Math.floor((fechaTx.getTime() - new Date(dispositivo.fecha_primer_uso).getTime()) / (1000 * 60 * 60 * 24)))
        : 0,

      distanciaKm,
      tiempoTranscurridoHoras,

      horaTransaccion: fechaTx.getHours(),

      anomaliasComportamiento: historialAlertas > 2 ? 3 : data.canal === 'atm' ? 1 : 0,

      paisDestino: paisActual,
      paisHabitual,
      esPaisVecino: ['Ecuador', 'Perú', 'Venezuela', 'Panamá', 'Brasil'].includes(paisActual),
      esPaisRiesgoMedio: ['México', 'Estados Unidos', 'España'].includes(paisActual),
      esPaisAltoRiesgo: ['Rusia', 'Corea del Norte', 'Irán', 'Siria', 'Nigeria'].includes(paisActual),
    };

    // 7. Evaluar riesgo con el motor de 7 factores
    const evaluacion = riskScoringEngine.evaluate(riskInput);

    // 8. Guardar transacción en PostgreSQL
    const nuevaTx = await prisma.transaccion.create({
      data: {
        id_cliente: data.id_cliente,
        id_dispositivo: data.id_dispositivo,
        id_ubicacion: data.id_ubicacion,
        id_banco: data.id_banco,
        tipo_transaccion: data.tipo_transaccion,
        monto: data.monto,
        cuenta_origen: data.cuenta_origen,
        cuenta_destino: data.cuenta_destino,
        score_riesgo: evaluacion.score,
        estado_transaccion: evaluacion.estadoTransaccion,
        canal: data.canal,
        moneda: data.moneda,
      },
    });

    // 9. Generar alerta si el score es >= 30
    let alertaGenerada = null;
    if (evaluacion.score >= 30) {
      alertaGenerada = await prisma.alerta.create({
        data: {
          id_transaccion: nuevaTx.id_transaccion,
          nivel_criticidad: evaluacion.nivel,
          factores_sospechosos: evaluacion.factoresSospechosos.join(' | '),
          estado_alerta: 'ACTIVA',
          prioridad: evaluacion.score >= 80 ? 10 : evaluacion.score >= 50 ? 7 : 4,
        },
      });
    }

    return { transaccion: nuevaTx, evaluacionRiesgo: evaluacion, alerta: alertaGenerada };
  },
};