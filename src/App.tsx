import Header from './components/Header';
import './App.css';



//import RegistroPosicionLayout from './layouts/RegistroPosicionLayout';
import DescargarRegistrosPosicionGEOJSON from './layouts/DescargaRegistrosPosicionGEOJSON';
import UnirArchivosGeoJSON from './layouts/UnificarArchivosGEOJSON';
import { MapaLibreGL } from './layouts/MapLibreGL';
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
