// src/mapa/components/SidebarNavigation.tsx
import { motion } from 'framer-motion';
import Compass from '../Compass';
import { ConfirmButton } from './BtnRevision';
import { type SidebarData } from '../../../../types';

interface SidebarNavigationProps {
  detallePunto: SidebarData;
  onConfirmarVisita: () => Promise<void>;
  compassRef: React.RefObject<any>;
}

export const SidebarNavigation = ({
  detallePunto,
  onConfirmarVisita,
  compassRef,
}: SidebarNavigationProps) => {
  return (
    <motion.div
      key="nav-tab-content"
      style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 15 }}
      transition={{ duration: 0.15 }}
    >
      <Compass size={240} ref={compassRef} />
      <div style={{ marginTop: '1rem', width: '100%' }}>
        <ConfirmButton 
          onClick={onConfirmarVisita} 
          detallePunto={detallePunto} 
        />
      </div>
    </motion.div>
  );
};