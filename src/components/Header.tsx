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

interface HeaderProps {
  onSelect: (view: string) => void;
}


const Header: React.FC<HeaderProps> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);

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
        <Box sx={{ width: 250 }} role="presentation" onClick={() => setOpen(false)}>
          <List>
            <ListItem disablePadding>
                <ListItemButton onClick={() => { onSelect("Inicio"); setOpen(false); }}>
                <ListItemText primary="Inicio" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton onClick={() => { onSelect("DescargarDatos"); setOpen(false); }}>
                <ListItemText primary="Descargar Datos" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton onClick={() => { onSelect("UnificarYguardarArchivos"); setOpen(false); }}>
                <ListItemText primary="Guardar archivos en BD" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton onClick={() => { onSelect("EliminarBD"); setOpen(false); }}>
                <ListItemText primary="Limpiar registros de la BD" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton onClick={() => { onSelect("Mapa"); setOpen(false); }}>
                <ListItemText primary="Mapa" />
                </ListItemButton>
            </ListItem>
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