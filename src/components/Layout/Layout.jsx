import React from 'react';
import DrawerAppBar from '../DrawerAppBar/DrawerAppBar';
import { Toolbar } from '@mui/material';

const Layout = ({ children }) => {
  
  return (
    <>
      <DrawerAppBar />
      <Toolbar /> {/* Spacer for fixed AppBar */}
      {children}
    </>
  );
};

export default Layout;
