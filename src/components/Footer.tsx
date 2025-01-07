import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Link,
} from '@mui/material';
import { Facebook, Twitter, Instagram, Send } from 'lucide-react';

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        pt: 8,
        pb: 4,
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
              HalalXplore
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Discover and share the best Halal dining experiences worldwide.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="primary">
                <Facebook size={20} />
              </IconButton>
              <IconButton color="primary">
                <Twitter size={20} />
              </IconButton>
              <IconButton color="primary">
                <Instagram size={20} />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['About Us', 'Contact', 'Blog', 'FAQ', 'Terms of Service', 'Privacy Policy'].map((link) => (
                <Link
                  key={link}
                  href="#"
                  color="text.secondary"
                  sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  {link}
                </Link>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
              Newsletter
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Subscribe to get updates about new features and Halal spots.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Your email"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  },
                }}
              />
              <Button variant="contained" color="primary">
                <Send size={20} />
              </Button>
            </Box>
          </Grid>
        </Grid>
        <Typography
          textAlign="center"
          color="text.secondary"
          sx={{ mt: 8, pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          © {new Date().getFullYear()} HalalXplore. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;