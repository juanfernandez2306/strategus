import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography"

import { useState } from "react";

// importa tu logo PNG
import logo from "../assets/logo_header.png";

import { INFO_FINCA } from "../data/finca/info";

interface HeaderProps {
  onSelect: (view: string) => void;
}


const Header: React.FC<HeaderProps> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { text: "Registro de datos", view: "Registro" },
    { text: "Mapa", view: "Mapa" },
    { text: "Resumen Jornada", view: "Resumen" },
    { text: "Exportar GeoJSON", view: "DescargarDatos" },
    { text: "Importar GeoJSON", view: "ImportarGeojson" },
    { text: "Generar QR Jornada", view: "GenerarQR" }, // Nueva opción
    { text: "Escanear QR Jornada", view: "EscanearQR" }, // Nueva opción
    { text: "Eliminar Base de Datos", view: "EliminarBD" },
  ];

  return (
    <>
      <AppBar position="static" color="transparent">
        <Toolbar sx={{ 
            display: "flex", 
            justifyContent: "space-between",
            backgroundColor: "var(--color-fondo)",
            borderRadius: "10px"
             }}>
          
          {/* Menú hamburguesa */}
          <IconButton
            edge="start"
            aria-label="menu"
            sx={{ 
                mr: 2 , 
                color: "var(--color-primario)",
                backgroundColor: "var(--color-fondo)",
                border: "2px solid var(--color-primario)"

            }}
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo + título */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img 
              src={logo} 
              alt="Logo" 
              style={{ height: "40px", marginRight: "8px" }} 
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer lateral */}
      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ 
            p: 1, 
            background: 'linear-gradient(180deg, rgba(253, 251, 0, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
            borderBottom: '1px solid #eee'
          }}>
            <Typography variant="overline" sx={{ color: 'var(--color-primario)', fontWeight: 'bold', lineHeight: 1 }}>
              Proyecto
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'black', textTransform: 'uppercase', mt: 0.5 }}>
              {INFO_FINCA.nombre}
            </Typography>
            
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" display="block" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {INFO_FINCA.razonSocial}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.8 }}>
                RIF: {INFO_FINCA.rif}
              </Typography>
            </Box>
          </Box>

          <Divider />
          
        <Box sx={{ width: 250 }} role="presentation" onClick={() => setOpen(false)}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.view} disablePadding>
                <ListItemButton onClick={() => { onSelect(item.view); setOpen(false); }}>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

        <Divider />
          <Box sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
            <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', color: 'gray' }}>
                DESARROLLADO POR:
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-primario)', fontWeight: 500 }}>
                Ing. Juan Fernandez
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                juanfernandez2306@gmail.com
            </Typography>
            <Typography 
              variant="overline" 
              display="block" 
              sx={{ 
                mt: 1, 
                fontSize: '0.65rem', // Un pelín más grande para legibilidad
                color: 'rgba(0, 0, 0, 0.54)', // Gris estándar de Material UI para texto secundario
                letterSpacing: '0.5px',
                fontWeight: 600,
                lineHeight: 1.2
              }}
            >
                SIGAL v1.0 - Gestión Palma Digital
            </Typography>
          </Box>

        </Box>
      </Drawer>
    </>
  );
};

export default Header;