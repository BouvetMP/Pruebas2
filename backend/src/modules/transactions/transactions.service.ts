// ¿Qué? Servicio de consulta de transacciones.
// ¿Para qué? Listar transacciones con filtro opcional por banco.
// ¿Impacto? Fuente de datos de la tabla de transacciones del frontend.

// ¿Qué? Servicio de transacciones integrado con la fórmula matemática de criticidad.
// ¿Para qué? Procesar nuevas operaciones calculando dinámicamente el score y creando alertas.
// ¿Impacto? Registra la transacción en PostgreSQL y activa el protocolo de prevención de fraude.

import { prisma } from '../../db/prisma.js';
import { riskScoringEngine } from './risk.service.js';

export const transactionsService = {
  async list(bancoCodigo?: string | null) {
    return prisma.$queryRaw<any[]>`SELECT * FROM trida.fn_transacciones(${bancoCodigo ?? null})`;
  },

  async create(data: any) {
    // 1. Consultar contexto del cliente, dispositivo y ubicación
    const [dispositivo, ubicacion, historialAlertas] = await Promise.all([
      prisma.dispositivo.findUnique({ where: { id_dispositivo: data.id_dispositivo } }),
      prisma.historicoUbicacion.findUnique({ where: { id_ubicacion: data.id_ubicacion } }),
      prisma.alerta.count({ where: { transaccion: { id_cliente: data.id_cliente } } }),
    ]);

    const fechaTx = new Date();

    // 2. Mapear datos a la interfaz de la Fórmula de Criticidad (F1 - F7)
    const riskInput = {
      montoActual: Number(data.monto),
      montoPromedio: 500000, // Promedio base del cliente
      desviacionEstandar: 200000,

      dispositivoConocido: !!dispositivo,
      dispositivoConfiable: dispositivo ? dispositivo.tipo_dispositivo !== 'DESCONOCIDO' : false,
      diasUsoDispositivo: dispositivo
        ? Math.floor((fechaTx.getTime() - new Date(dispositivo.fecha_primer_uso).getTime()) / (1000 * 60 * 60 * 24))
        : 0,

      distanciaKm: ubicacion?.ciudad === 'Cúcuta' ? 600 : 10,
      tiempoTranscurridoHoras: 2,

      horaTransaccion: fechaTx.getHours(),

      anomaliasComportamiento: historialAlertas > 2 ? 3 : data.canal === 'atm' ? 1 : 0,

      paisDestino: ubicacion?.pais ?? 'Colombia',
      paisHabitual: 'Colombia',
      esPaisVecino: false,
      esPaisRiesgoMedio: false,
      esPaisAltoRiesgo: ubicacion?.pais ? ubicacion.pais !== 'Colombia' : false,
    };

    // 3. Evaluar riesgo con la fórmula matemática: Score = Σ (Wᵢ × Fᵢ) × 100
    const evaluacion = riskScoringEngine.evaluate(riskInput);

    // 4. Guardar la transacción en la base de datos
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

    // 5. Generar alerta si el score es mayor o igual a 30 (según tabla de decisiones)
    let alertaGenerada = null;
    if (evaluacion.score >= 30) {
      alertaGenerada = await prisma.alerta.create({
        data: {
          id_transaccion: nuevaTx.id_transaccion,
          nivel_criticidad: evaluacion.nivel,
          factores_sospechosos: evaluacion.factoresSospechosos.join(' | '),
          estado_alerta: 'ACTIVA',
          prioridad: evaluacion.score >= 80 ? 10 : 5,
        },
      });
    }

    return { transaccion: nuevaTx, evaluacionRiesgo: evaluacion, alerta: alertaGenerada };
  },
};