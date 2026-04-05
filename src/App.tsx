import Header from './components/Header';
import './App.css';


//import RegistroPosicionLayout from './layouts/RegistroPosicionLayout';
import ExportarGeoJSON from './features/descargarDatos/ExportarGeojson';
import { MapLibre } from './features/mapa/MapLibre.tsx';
import { useState } from 'react';
import RegistroPosicionLayout  from './features/registroPosicion/RegistroPosicionLayout.tsx';
import ImportarGeojson from './features/unificarGuardarDatos/ImportarGeojson.tsx';
import EliminarRegistros from './features/eliminarBD/EliminarRegistro.tsx';
import GenerarQrJornada from './features/qr/GenerarQrJornada.tsx';
import ScannerJornada from './features/qr/ScannerJornada';
import ResumenJornadaLayout from './features/resumen/ResumenJornada.tsx';

function App() {

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
        return <ScannerJornada />;
      case "EliminarBD":
        return <EliminarRegistros />;
      case "Mapa":
        return <MapLibre />;
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
