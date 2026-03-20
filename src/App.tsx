import Header from './components/Header';
import './App.css';



//import RegistroPosicionLayout from './layouts/RegistroPosicionLayout';
import DescargarRegistrosPosicionGEOJSON from './layouts/DescargaRegistrosPosicionGEOJSON';
import { MapaLibreGL } from './layouts/MapLibreGL';
import { useState } from 'react';
import RegistroPosicionLayout from './layouts/RegistroPosicionLayout';
import UnirYguardarArchivosGeoJSON  from './layouts/UnificarYguardarArchivosGEOJSON';
import DeleteIndexeDBcapture from './layouts/DeleteIndexedDBcapture';

function App() {

  const [selectedView, setSelectedView] = useState("Inicio");

  const renderContent = () => {
    switch (selectedView) {
      case "Inicio":
        return <RegistroPosicionLayout />;
      case "DescargarDatos":
        return <DescargarRegistrosPosicionGEOJSON />;
      case "UnificarYguardarArchivos":
        return <UnirYguardarArchivosGeoJSON />
      case "EliminarBD":
        return <DeleteIndexeDBcapture />
      case "Mapa":
        return <MapaLibreGL />
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
