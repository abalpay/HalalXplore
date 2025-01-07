import { Box, Card, Container, Grid, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { MapPin, Star, BookmarkCheck } from 'lucide-react';

const features = [
  {
    icon: <MapPin size={40} />,
    title: 'Find Halal-Friendly Options',
    description: 'Discover verified Halal restaurants and eateries near you with our comprehensive database.',
  },
  {
    icon: <Star size={40} />,
    title: 'Share Reviews & Ratings',
    description: 'Help the community by sharing your experiences and rating Halal establishments.',
  },
  {
    icon: <BookmarkCheck size={40} />,
    title: 'Save Favorite Locations',
    description: 'Bookmark your favorite spots for quick access and create personalized lists.',
  },
];

const FeaturesGrid = () => {
  return (
    <Box sx={{ py: 10, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          textAlign="center"
          sx={{ mb: 6, color: 'text.primary' }}
        >
          Everything You Need
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: 'primary.main',
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" sx={{ mb: 2, color: 'text.primary' }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturesGrid;