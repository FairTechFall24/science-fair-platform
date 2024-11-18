import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProjectsContent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
        My Projects
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
        <Button
          variant="contained"
          sx={{ backgroundColor: 'primary' }}
          onClick={() => navigate('/project-registration')}
        >
          Create a New Project
        </Button>
        <Button
          variant="outlined"
          sx={{ borderColor: 'primary', color: 'primary' }}
        >
          Join an Existing Project
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary">
        2 / 5 Projects
      </Typography>

      <Box sx={{ border: '1px solid #ccc', padding: 2, marginTop: 2 }}>
        <List>
          <ListItem>
            <ListItemText primary="Baking Soda Volcano" secondary="Active" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Magnet Project" secondary="Inactive" />
          </ListItem>
        </List>
      </Box>
    </>
  );
};

export default ProjectsContent;
