import Header from './components/Header';
import './App.css';



//import RegistroPosicionLayout from './layouts/RegistroPosicionLayout';
import DescargarRegistrosPosicionGEOJSON from './layouts/DescargaRegistrosPosicionGEOJSON';
//import { MapaLibreGL } from './layouts/MapLibreGL';
import { MapLibre } from './features/mapa/MapLibre.tsx';
import { useState } from 'react';
import RegistroPosicionLayout  from './features/registroPosicion/RegistroPosicionLayout.tsx';
import UnirYguardarArchivosGeoJSON  from './layouts/UnificarYguardarArchivosGEOJSON';
import DeleteIndexeDBcapture from './layouts/DeleteIndexedDBcapture';
import GenerarQrJornada from './layouts/GenerarQrJornada';
import ScannerJornada from './layouts/ScannerJornada';

function App() {

  const [selectedView, setSelectedView] = useState("Inicio");

  const renderContent = () => {
    switch (selectedView) {
      case "Inicio":
        return <RegistroPosicionLayout />;
      case "DescargarDatos":
        return <DescargarRegistrosPosicionGEOJSON />;
      case "UnificarYguardarArchivos":
        return <UnirYguardarArchivosGeoJSON />;
      case "GenerarQR": // Nueva vista
        return <GenerarQrJornada />;
      case "EscanearQR": // Nueva vista
        return <ScannerJornada />;
      case "EliminarBD":
        return <DeleteIndexeDBcapture />;
      case "Mapa":
        return <MapLibre />;
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
