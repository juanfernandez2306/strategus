import React, { useState } from "react";
import styles from "./Header.module.css";
import logo from "../assets/logo_header.png";
import { INFO_FINCA } from "../data/finca/info";

interface HeaderProps {
  onSelect: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { text: "Registro de datos", view: "Registro" },
    { text: "Lista de registro pedientes", view: "ListaPendiente"},
    { text: "Mapa", view: "Mapa" },
    { text: "Resumen Jornada", view: "Resumen" },
    { text: "Exportar GeoJSON", view: "DescargarDatos" },
    { text: "Importar GeoJSON", view: "ImportarGeojson" },
    { text: "Generar QR Jornada", view: "GenerarQR" },
    { text: "Escanear QR Jornada", view: "EscanearQR" },
    { text: "Eliminar Base de Datos", view: "EliminarBD" },
  ];

  const handleNav = (view: string) => {
    onSelect(view);
    setOpen(false);
  };

  return (
    <>
      <header className={styles.appBar}>
        <div className={styles.toolbar}>
          {/* Botón menú simple (SVG inline) */}
          <button 
            className={styles.menuButton} 
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div className={styles.logoContainer}>
            <img src={logo} alt="Logo" />
          </div>
        </div>
      </header>

      {/* Drawer y Overlay */}
      {open && (
        <>
          <div className={styles.overlay} onClick={() => setOpen(false)} />
          <aside className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <span className={styles.projectLabel}>PROYECTO</span>
              <strong className={styles.projectName}>{INFO_FINCA.nombre}</strong>
              <div style={{ marginTop: '8px' }}>
                <small style={{ display: 'block', fontWeight: 600 }}>{INFO_FINCA.razonSocial}</small>
                <small style={{ opacity: 0.8 }}>RIF: {INFO_FINCA.rif}</small>
              </div>
            </div>

            <nav className={styles.menuList}>
              {menuItems.map((item) => (
                <button 
                  key={item.view} 
                  className={styles.menuItemButton}
                  onClick={() => handleNav(item.view)}
                >
                  {item.text}
                </button>
              ))}
            </nav>

            <footer className={styles.footer}>
              <span className={styles.footerLabel}>DESARROLLADO POR:</span>
              <div style={{ fontWeight: 500, color: 'var(--color-primario)' }}>
                Ing. Juan Fernandez
              </div>
              <div style={{ color: '#666' }}>juanfernandez2306@gmail.com</div>
              <div className={styles.versionTag}>
                SIGAL v1.0 - Gestión Palma Digital
              </div>

              <button 
                type="button"
                className={styles.closeMenuButton}
                onClick={() => setOpen(false)}
              >
                Cerrar Menú
              </button>

            </footer>
          </aside>
        </>
      )}
    </>
  );
};

export default Header;