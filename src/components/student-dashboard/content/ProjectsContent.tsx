import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  DialogTitle,
  DialogContent,
  Dialog,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getStudentDashboardProjects,
  removeProjectFromStudent,
  deleteProject,
} from '../../../services/project.services';

//Import Image Assets
import ScienceTestTubes from '../../../assets/images/ScienceAtom.png';
import ScienceAtom from '../../../assets/images/ScienceMicroscope.png';
import ScienceMicroscope from '../../../assets/images/ScienceTestTubes.png';

const ProjectsContent: React.FC = () => {
  const navigate = useNavigate();
  const { authStatus } = useAuth();

  const images = [ScienceTestTubes, ScienceAtom, ScienceMicroscope]; //List full of our images

  const [projects, setProjects] = useState<Project[]>([]);
  const [reload, setReload] = useState(false); // State to trigger useEffect
  const [showConfirmRemovalDialog, setShowConfirmRemovalDialog] =
    useState(false); //This controls weather our pop up window to confirm project removal is visable
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  ); //This holds the ID of the project we want to delete (initialized to 'null' as at the begining there are no projects selected to be removed)

  interface Project {
    projectID: string;
    projectName: string;
    projectStatus: string;
    projectMembers: string;
  }

  //Methods
  const handleRemoveProject = (projectId: string) => {
    //Show the confirmation dialog window
    setShowConfirmRemovalDialog(true);
    setSelectedProjectId(projectId);
  };

  const handleConfirmRemove = async () => {
    //Remove the project with the given ID
    await removeProjectFromStudent(selectedProjectId, authStatus.user?.uid);
    //Delete project is there are no students assigned to it
    await deleteProject(selectedProjectId);
    //Close confirmation dialog window
    setShowConfirmRemovalDialog(false);
    // After updating the database, trigger the useEffect
    setReload(!reload);
  };

  const handleCancelRemove = () => {
    //Nothing Happens when cancelled + close confirmation dialog window
    setShowConfirmRemovalDialog(false);
  };

  useEffect(() => {
    async function loadProjects() {
      try {
        const userProjects =
          (await getStudentDashboardProjects(authStatus.user?.uid)) ?? [];
        const resolvedProjects = await Promise.all(
          userProjects.map(async (project) => ({
            projectID: project.projectID,
            projectName: project.projectName,
            projectStatus: project.projectStatus,
            projectMembers: await project.projectMembers,
          }))
        );
        setProjects(resolvedProjects);
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    }

    loadProjects();
  }, [reload]);

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
        Projects Enrolled: {projects.length}
      </Typography>

      {/* All Projects listed under the teacher's class*/}
      <List>
        {projects.length === 0 ? ( //If there are no projects in the class project list, give a small message of encouragment
          <Typography variant="h5" align="center" sx={{ marginTop: '100px' }}>
            No Projects Currently...
            <br />
            Create a New Project or Join a Partner's Project Soon!
          </Typography>
        ) : (
          //Else, there are at least 1 to many projects currently in the class project list
          projects.map((project, index) => (
            <ListItem key={project.projectID}>
              <img
                src={images[index % images.length]} //This will rotate through the images we have in our image list for UI Design for each row of projects in the table
                style={{ width: '50px', height: 'auto' }}
                alt=""
              />

              <ListItemText
                primary={project.projectName}
                secondary={project.projectMembers}
                style={{ marginLeft: '20px' }}
              />

              <Button
                variant="contained"
                sx={{ backgroundColor: '#ffffff', color: '#5a2b8c' }} //Need implemention to navigate to project dashboard
              >
                View Project
              </Button>

              <Button
                variant="contained"
                sx={{ backgroundColor: '#ffffff', color: '#d30000' }}
                onClick={() => handleRemoveProject(project.projectID)} // Show confirmation dialog
              >
                Remove
              </Button>
            </ListItem>
          ))
        )}
      </List>
      {/* Confirmation dialog */}
      <Dialog open={showConfirmRemovalDialog} onClose={handleCancelRemove}>
        <DialogTitle>Confirm Project Removal</DialogTitle>
        <DialogContent>
          Are you sure you want to remove the "
          {projects.find((project) => project.projectID === selectedProjectId)
            ?.projectName ?? 'No project found'}
          " Project from your project dashboard?
          <br />
          <br />
          Please note this cannot be undone and may be deleted
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#ffffff', color: '#013220' }}
            onClick={handleConfirmRemove}
          >
            Yes
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#ffffff', color: '#8B0000' }}
            onClick={handleCancelRemove}
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectsContent;
