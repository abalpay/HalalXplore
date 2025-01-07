import { Box, Typography } from '@mui/material';
import { Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        transition: 'opacity 0.2s',
        '&:hover': {
          opacity: 0.8,
        },
      }}>
        <Utensils size={24} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          HalalXplore
        </Typography>
      </Box>
    </Link>
  );
}