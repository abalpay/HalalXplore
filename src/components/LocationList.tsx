import { Box, Card, CardContent, CardMedia, Typography, Button, Chip, Rating } from '@mui/material';

interface Location {
  id: string;
  name: string;
  distance: string;
  rating: number;
  hours: string;
  description: string;
  cuisine: string;
  image: string;
  isOpen: boolean;
}

const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Halal Guys',
    distance: '0.5 km',
    rating: 4.5,
    hours: 'Open until 10 PM',
    description: 'Famous for their platters and gyros',
    cuisine: 'Middle Eastern',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&h=250',
    isOpen: true,
  },
  // Add more mock locations as needed
];

export default function LocationList() {
  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
      {mockLocations.map((location) => (
        <Card key={location.id} sx={{ mb: 2 }}>
          <CardMedia
            component="img"
            height="140"
            image={location.image}
            alt={location.name}
          />
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6">{location.name}</Typography>
              <Chip 
                label={location.isOpen ? 'Open' : 'Closed'}
                color={location.isOpen ? 'success' : 'default'}
                size="small"
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Rating value={location.rating} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                {location.distance}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              {location.hours}
            </Typography>
            
            <Typography variant="body2" sx={{ mt: 1 }}>
              {location.description}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Chip label={location.cuisine} size="small" />
              <Button variant="contained" size="small">
                View Details
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}