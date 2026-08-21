// ¿Qué? Motor determinista de cálculo de score de riesgo basado en 7 factores ponderados.
// ¿Para qué? Implementar la fórmula exacta de criticidad.md: Score = Σ (Wᵢ × Fᵢ) × 100.
// ¿Impacto? Es el núcleo matemático de prevención de fraude del sistema TriDa.

export interface TransactionRiskInput {
  montoActual: number;
  montoPromedio: number;
  desviacionEstandar: number;
  
  dispositivoConocido: boolean;
  dispositivoConfiable: boolean;
  diasUsoDispositivo: number;

  distanciaKm: number;
  tiempoTranscurridoHoras: number;

  horaTransaccion: number;
  
  anomaliasComportamiento: number; // 0 a 4 (monto, tipo, destino, frecuencia)
  
  paisDestino: string;
  paisHabitual: string;
  esPaisVecino: boolean;
  esPaisRiesgoMedio: boolean;
  esPaisAltoRiesgo: boolean;
}

export const riskScoringEngine = {
  evaluate(input: TransactionRiskInput) {
    const factores: string[] = [];

    // ==========================================
    // CÁLCULO DE FACTORES (0.0 a 1.0)
    // ==========================================

    // F1: Desviación del Monto
    let fMonto = 0.0;
    if (input.desviacionEstandar > 0) {
      fMonto = Math.min(1.0, Math.abs(input.montoActual - input.montoPromedio) / input.desviacionEstandar);
    }
    if (fMonto > 0.5) factores.push(`Monto se desvía fuertemente del promedio histórico`);

    // F2: Dispositivo Desconocido
    let fDispositivo = 0.0;
    if (input.dispositivoConocido && input.dispositivoConfiable) fDispositivo = 0.0;
    else if (input.dispositivoConocido && !input.dispositivoConfiable) fDispositivo = 0.3;
    else if (!input.dispositivoConocido && input.diasUsoDispositivo > 0 && input.diasUsoDispositivo < 7) fDispositivo = 0.7;
    else if (!input.dispositivoConocido && input.diasUsoDispositivo === 0) fDispositivo = 1.0;
    if (fDispositivo >= 0.7) factores.push(`Uso de dispositivo nuevo o no reconocido`);

    // F3: Ubicación Inusual
    const fUbicacion = Math.min(1.0, input.distanciaKm / 1000);
    if (fUbicacion > 0.5) factores.push(`Ubicación inusualmente lejana de su zona habitual`);

    // F4: Velocidad Transaccional
    let fVelocidad = 0.0;
    if (input.tiempoTranscurridoHoras > 0) {
      const velocidadReq = input.distanciaKm / input.tiempoTranscurridoHoras;
      if (velocidadReq <= 100) fVelocidad = 0.0;
      else if (velocidadReq <= 500) fVelocidad = 0.5;
      else fVelocidad = 1.0;
    }
    if (fVelocidad === 1.0) factores.push(`Viaje físicamente imposible entre la transacción anterior y esta`);

    // F5: Horario Inusual
    let fHorario = 0.0;
    const isMadrugada = input.horaTransaccion >= 23 || input.horaTransaccion <= 6;
    if (isMadrugada) {
      fHorario = 0.7; // Si es madrugada y opera ocasionalmente (simplificado)
      factores.push(`Transacción realizada en horario de madrugada`);
    }

    // F6: Desviación del Comportamiento (0 a 4 anomalías)
    const fComportamiento = Math.min(1.0, input.anomaliasComportamiento / 4.0);
    if (fComportamiento > 0) factores.push(`Presenta ${input.anomaliasComportamiento} banderas rojas de comportamiento`);

    // F7: País de Riesgo
    let fPais = 0.0;
    if (input.paisDestino === input.paisHabitual) fPais = 0.0;
    else if (input.esPaisVecino) fPais = 0.2;
    else if (input.esPaisRiesgoMedio) fPais = 0.5;
    else if (input.esPaisAltoRiesgo) { fPais = 1.0; factores.push(`Transacción originada en país de alto riesgo`); }
    else fPais = 0.8;

    // ==========================================
    // FÓRMULA FINAL: Score = Σ (Wᵢ × Fᵢ) × 100
    // ==========================================
    
    const pesos = {
      monto: 0.25,
      dispositivo: 0.20,
      ubicacion: 0.18,
      velocidad: 0.15,
      horario: 0.10,
      comportamiento: 0.07,
      pais: 0.05
    };

    const scoreCrudo = (
      (pesos.monto * fMonto) +
      (pesos.dispositivo * fDispositivo) +
      (pesos.ubicacion * fUbicacion) +
      (pesos.velocidad * fVelocidad) +
      (pesos.horario * fHorario) +
      (pesos.comportamiento * fComportamiento) +
      (pesos.pais * fPais)
    );

    const scoreFinal = Math.round(scoreCrudo * 100);

    // ==========================================
    // CLASIFICACIÓN Y DECISIÓN
    // ==========================================
    
    let nivel: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA' = 'BAJA';
    let estadoTransaccion: 'APROBADA' | 'ALERTADA' | 'BLOQUEADA' = 'APROBADA';

    if (scoreFinal >= 95) {
      nivel = 'CRITICA';
      estadoTransaccion = 'BLOQUEADA';
    } else if (scoreFinal >= 80) {
      nivel = 'ALTA';
      estadoTransaccion = 'APROBADA'; // El documento dice: Generar alerta alta + aprobar
    } else if (scoreFinal >= 50) {
      nivel = 'MEDIA';
      estadoTransaccion = 'APROBADA'; 
    } else if (scoreFinal >= 30) {
      nivel = 'BAJA';
      estadoTransaccion = 'APROBADA';
    } else {
      nivel = 'BAJA';
      estadoTransaccion = 'APROBADA';
    }

    return {
      score: scoreFinal,
      nivel,
      estadoTransaccion,
      factoresSospechosos: factores.length > 0 ? factores : ['Ninguna anomalía detectada']
    };
  }
};