// ¿Qué? Punto de entrada de la aplicación React.
// ¿Para qué? Montar la aplicación en el DOM e importar los estilos globales.
// ¿Impacto? Primer archivo en ejecutarse al cargar el frontend.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Estilos de librerías globales + estilos del proyecto
import 'leaflet/dist/leaflet.css';
import './styles/index.css';

// ==============================================================================
// MONTAR LA APLICACIÓN
// ==============================================================================

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'No se encontró el elemento #root en el DOM. ' +
      'Verifica que index.html tenga <div id="root"></div>.',
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);