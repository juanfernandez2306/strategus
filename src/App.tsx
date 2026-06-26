import Header from './components/Header';
import './App.css';


import ExportarGeoJSON from './features/descargarDatos/ExportarGeojson';
import { useState } from 'react';
import RegistroPosicionLayout  from './features/registroPosicion/RegistroPosicionLayout';
import ImportarGeojson from './features/unificarGuardarDatos/ImportarGeojson';
import EliminarRegistros from './features/eliminarBD/EliminarRegistro';
import GenerarQrJornada from './features/qr/GenerarQrJornada';
import ScannerJornada from './features/qr/ScannerJornada';

import ResumenJornadaLayout from './features/resumen/ResumenJornada';

import { NOMBRE_APP } from './data/finca/appConfig';


import { MapLibreGL } from './features/mapa/MapLibreGL';

import LoginLayout from './layouts/LoginLayout';

import { useAuthStore } from './hooks/useAuthStore';

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
        return isLogged ? 
        <ResumenJornadaLayout /> : 
        <LoginLayout />;
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
