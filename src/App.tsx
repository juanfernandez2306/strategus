import Header from './components/Header';
import './App.css';



//import RegistroPosicionLayout from './layouts/RegistroPosicionLayout';
import ExportarGeoJSON from './features/descargarDatos/ExportarGeojson';
import { MapLibre } from './features/mapa/MapLibre.tsx';
import { useState } from 'react';
import RegistroPosicionLayout  from './features/registroPosicion/RegistroPosicionLayout.tsx';
import ImportarGeojson from './features/unificarGuardarDatos/ImportarGeojson.tsx';
import DeleteIndexeDBcapture from './layouts/DeleteIndexedDBcapture';
import GenerarQrJornada from './features/qr/GenerarQrJornada.tsx';
import ScannerJornada from './features/qr/ScannerJornada';

function App() {

  const [selectedView, setSelectedView] = useState("Inicio");

  const renderContent = () => {
    switch (selectedView) {
      case "Inicio":
        return <RegistroPosicionLayout />;
      case "DescargarDatos":
        return <ExportarGeoJSON />;
      case "UnificarYguardarArchivos":
        return <ImportarGeojson />;
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
