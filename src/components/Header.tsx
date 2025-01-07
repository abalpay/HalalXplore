import { useState } from 'react';
import { AppBar, Toolbar, IconButton, Box, Button } from '@mui/material';
import { Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import Logo from './Logo';

export default function Header() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          background: 'rgba(43, 45, 66, 0.95)',
          backdropFilter: 'blur(8px)',
        }}
        elevation={0}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Logo />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton color="inherit">
              <Search />
            </IconButton>
            
            <Button 
              color="inherit"
              onClick={() => navigate('/feed')}
            >
              Feed
            </Button>
            
            <Button 
              color="inherit"
              onClick={() => navigate('/discover')}
            >
              Discover
            </Button>
            
            <IconButton 
              color="inherit"
              onClick={() => setIsAuthOpen(true)}
            >
              <User />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <AuthModal 
        open={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );
}