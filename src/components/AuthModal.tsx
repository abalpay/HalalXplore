import { Dialog, DialogTitle, DialogContent, TextField, Button, Box, Divider, Typography } from '@mui/material';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Sign In</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
          />
          <Button variant="contained" fullWidth>
            Sign In
          </Button>
          
          <Divider>or</Divider>
          
          <Button variant="outlined" fullWidth>
            Continue as Guest
          </Button>
          
          <Typography variant="body2" align="center">
            Don't have an account?{' '}
            <Button color="primary">
              Sign Up
            </Button>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}