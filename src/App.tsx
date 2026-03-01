import Header from './components/Header';
import './App.css';



//import RegistroPosicionLayout from './layouts/RegistroPosicionLayout';
import DescargarRegistrosPosicionGEOJSON from './layouts/DescargaRegistrosPosicionGEOJSON';
import UnirArchivosGeoJSON from './layouts/UnificarArchivosGEOJSON';
import { MapaFullLayout } from './layouts/MapLeaflet';
import { useState } from 'react';
import RegistroPosicionLayout from './layouts/RegistroPosicionLayout';

function App() {

  const [selectedView, setSelectedView] = useState("Inicio");

  const renderContent = () => {
    switch (selectedView) {
      case "Inicio":
        return <RegistroPosicionLayout />;
      case "DescargarDatos":
        return <DescargarRegistrosPosicionGEOJSON />;
      case "UnificarArchivos":
        return <UnirArchivosGeoJSON />
      case "Mapa":
        return <MapaFullLayout />
      default:
        return <RegistroPosicionLayout />;
    }
  };



  return (
    <>
      <Header onSelect={setSelectedView} />
      <main style={selectedView === "Mapa" ? { padding: 0 } : {}}>
        {renderContent()}
      </main>
    </>
  )
}

export default App
