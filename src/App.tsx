import Header from './components/Header';
import './App.css';


import ExportarGeoJSON from './features/descargarDatos/ExportarGeojson';
import { useState, lazy, Suspense } from 'react';
import RegistroPosicionLayout  from './features/registroPosicion/RegistroPosicionLayout';
import ImportarGeojson from './features/unificarGuardarDatos/ImportarGeojson';
import EliminarRegistros from './features/eliminarBD/EliminarRegistro';
import GenerarQrJornada from './features/qr/GenerarQrJornada';

import ResumenJornadaLayout from './features/resumen/ResumenJornada';

import { NOMBRE_APP } from './data/finca/appConfig';


const ScannerJornada = lazy(() => import('./features/qr/ScannerJornada'));

const MapLibreGL = lazy(() => 
    import('./features/mapa/MapLibreGL').then(module => ({ default: module.MapLibreGL }))
  );

function App() {

  document.title = NOMBRE_APP;

  const [selectedView, setSelectedView] = useState("Inicio");

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
          return (
            <Suspense fallback={
              <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
                Cargando motor de escaneo...
              </div>
            }>
              <ScannerJornada />
            </Suspense>
          );
      case "EliminarBD":
        return <EliminarRegistros />;
      case "Mapa":
        return (
          <Suspense fallback={
            <div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>
              Inicializando motor de mapas...
            </div>
          }>
            <MapLibreGL />
          </Suspense>
        );
      case "Resumen":
        return <ResumenJornadaLayout />
      default:
        return <RegistroPosicionLayout />;
    }
  };



  return (
     <>
      <Header onSelect={setSelectedView} />
      <main style={selectedView === "Mapa" ? { padding: 0, margin: 0, maxWidth: '100%', width: '100%' } : {}}>
        {renderContent()}
      </main>
    </> 
  )
}

export default App
