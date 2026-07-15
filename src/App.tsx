import Header from './components/Header';
import './App.css';


import ExportarGeoJSON from './features/descargarDatos/ExportarGeojson';
import { useState } from 'react';
import RegistroPosicionLayout  from './features/registroPosicion/RegistroPosicionLayout';
import ImportarGeojson from './features/unificarGuardarDatos/ImportarGeojson';
import EliminarRegistros from './features/eliminarBD/EliminarRegistro';
import GenerarQrJornada from './features/qr/GenerarQrJornada';
import ScannerJornada from './features/qr/ScannerJornada';
import { ListaDestino } from './features/listaDestino/ListaDestino';

import ResumenJornadaLayout from './features/resumen/ResumenJornada';

import { NOMBRE_APP } from './data/finca/appConfig';


import { MapLibreGL } from './features/mapa/MapLibreGL';

import LoginLayout from './features/login/LoginLayout';

import { useAuthStore } from './features/login/hooks/useAuthStore';

import { motion, AnimatePresence } from 'framer-motion';

function App() {

  document.title = NOMBRE_APP;

  const [selectedView, setSelectedView] = useState("Inicio");

  const isLogged = useAuthStore((state) => state.isLogged);

  const renderContent = () => {
    switch (selectedView) {
      case "Registro":
        return <RegistroPosicionLayout />;
      case "DescargarDatos":
        return <ExportarGeoJSON />;
      case "ImportarGeojson":
        return <ImportarGeojson />;
      case "GenerarQR": // Nueva vista
        return <GenerarQrJornada />;
      case "EscanearQR": // Nueva vista
             return <ScannerJornada />
            
      case "EliminarBD":
        return <EliminarRegistros />;
      case "Mapa":
        return <MapLibreGL />

      case "Resumen":
        return (
          /* AnimatePresence mode="wait" asegura que la pantalla vieja termine 
             de desaparecer antes de que la nueva empiece a entrar */
          <AnimatePresence mode="wait">
            {isLogged ? (
              <motion.div
                key="resumen-jornada" // Clave única indispensable
                initial={{ opacity: 0, y: 15 }} // Estado inicial (invisible y un poco desplazado abajo)
                animate={{ opacity: 1, y: 0 }}   // Estado visible
                exit={{ opacity: 0, y: -15 }}    // Estado de salida (se va desvaneciendo hacia arriba)
                transition={{ duration: 0.35, ease: 'easeInOut' }} // Transición suave
                style={{ width: '100%', height: '100%' }} // Evita descuadres visuales
              >
                <ResumenJornadaLayout />
              </motion.div>
            ) : (
              <motion.div
                key="login-layout" // Clave única indispensable
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                style={{ width: '100%', height: '100%' }}
              >
                <LoginLayout />
              </motion.div>
            )}
          </AnimatePresence>
        );
      case "ListaPendiente":
        return <ListaDestino />
      default:
        return <RegistroPosicionLayout />;
    }
  };



  return (
     <div className="app-container">

        <Header onSelect={setSelectedView} />
      
        <main 
          className="main-content"
          data-view={selectedView}>
          {renderContent()}
        </main>

    </div>
  )
}

export default App
