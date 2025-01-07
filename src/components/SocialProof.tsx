import { Box, Container, Typography, Card, Avatar } from '@mui/material';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Sarah Ahmed',
    role: 'Food Blogger',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    text: 'HalalXplore has transformed how I discover new restaurants. It\'s an essential tool for any Halal food enthusiast!',
  },
  {
    name: 'Mohammed Khan',
    role: 'Travel Vlogger',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    text: 'As someone who travels frequently, this app has been a game-changer in finding authentic Halal food worldwide.',
  },
  {
    name: 'Fatima Hassan',
    role: 'Community Leader',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
    text: 'The community features are fantastic! It\'s great to connect with others and share recommendations.',
  },
];

const SocialProof = () => {
  return (
    <Box sx={{ py: 10, backgroundColor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          textAlign="center"
          sx={{ mb: 6, color: 'text.primary' }}
        >
          What Our Users Say
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
          }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              style={{ flex: 1 }}
            >
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Avatar
                  src={testimonial.avatar}
                  sx={{ width: 80, height: 80, mb: 2 }}
                />
                <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
                  {testimonial.name}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 2, color: 'primary.main' }}
                >
                  {testimonial.role}
                </Typography>
                <Typography color="text.secondary">
                  "{testimonial.text}"
                </Typography>
              </Card>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default SocialProof;