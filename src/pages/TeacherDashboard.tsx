import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
//import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAuth } from 'firebase/auth';
import {
  getTeacherDashboardProjects,
  removeClassCodeFromProject,
} from '../services/project.services';

//Import Image Assets
import ScienceTestTubes from '../assets/images/ScienceTestTubes.png';
import ScienceAtom from '../assets/images/ScienceAtom.png';
import ScienceMicroscope from '../assets/images/ScienceMicroscope.png';

const ClassDashboard: React.FC = () => {
  const { authStatus } = useAuth();
  //Initialize some Variables
  const teacherName = authStatus.metadata?.lastName;
  const images = [ScienceTestTubes, ScienceAtom, ScienceMicroscope]; //List full of our images

  //Hooks
  const [classCode, setClassCode] = useState('');
  const [reload, setReload] = useState(false); // State to trigger useEffect
  const [projects, setProjects] = useState<Project[]>([]);
  const [showConfirmRemovalDialog, setShowConfirmRemovalDialog] =
    useState(false); //This controls weather our pop up window to confirm project removal is visable
  const [showProjectStatusDialog, setShowProjectStatusDialog] = useState(false); //This controls weather our pop up window to see project status is visable
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

  const handleConfirmRemove = () => {
    //Remove the project with the given ID
    removeClassCodeFromProject(selectedProjectId);
    //Close confirmation dialog window
    setShowConfirmRemovalDialog(false);
    // After updating the database, trigger the useEffect
    setReload(!reload);
  };

  const handleCancelRemove = () => {
    //Nothing Happens when cancelled + close confirmation dialog window
    setShowConfirmRemovalDialog(false);
  };

  const handleShowProjectStatus = (projectId: string) => {
    //Show the confirmation dialog window
    setShowProjectStatusDialog(true);
    setSelectedProjectId(projectId);
  };

  const handleExitProjectStaus = () => {
    //Nothing Happens when cancelled + close confirmation dialog window
    setShowProjectStatusDialog(false);
  };

  async function getClassCode() {
    try {
      // Get the currently authenticated user
      const auth = getAuth();
      const user = auth.currentUser;

      // Check if user is authenticated
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Get the user's document using their UID
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      // Check if the document exists and has the classId field
      if (userDoc.exists()) {
        const classId = userDoc.data().classID;
        if (classId) {
          return classId;
        } else {
          throw new Error('No class code found for this user');
        }
      } else {
        throw new Error('User document not found');
      }
    } catch (error) {
      console.error('Error fetching class code:', error);
      throw error;
    }
  }

  useEffect(() => {
    async function fetchClassCode() {
      try {
        const code = await getClassCode();
        setClassCode(code);
      } catch (error) {
        console.error('Error fetching class code:', error);
        throw error;
      }
    }
    async function loadProjects() {
      try {
        const userProjects = await getTeacherDashboardProjects(
          await getClassCode()
        );

        //In case there is no classCode available, defualt to an empty list
        if (!userProjects) {
          console.log('No projects found');
          setProjects([]);
          return;
        }

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
    fetchClassCode();
  }, [reload]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar*/}
      <Box
        sx={{
          width: '20%',
          backgroundColor: '#6a1b9a',
          color: 'white',
          padding: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Class Dashboard
        </Typography>
        <List>
          <ListItem component="button">
            <ListItemText primary="Account Settings" />
          </ListItem>
        </List>
      </Box>

      {/* Main content area */}
      <Box sx={{ flexGrow: 1, padding: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: '#5a2b8c', marginBottom: '60px' }}
        >
          Have Students Join Using Class Code:
          {/* using span we can customize the other part of the text so the "class code" is a gold color*/}
          <span style={{ color: '#d9b63c' }}>
            {' '}
            <br /> {classCode}!
          </span>
        </Typography>

        <Box //These next two texts are side by side by design
          display="flex"
          alignItems="center" //Vertically centers items side by side
          justifyContent="space-between" //Adjust spacing between the text
        >
          <Typography variant="h3" gutterBottom sx={{ color: '#5a2b8c' }}>
            {teacherName}'s Class!
          </Typography>

          <Typography variant="body1" sx={{ marginRight: '35px' }}>
            Projects Enrolled: {projects.length}
          </Typography>
        </Box>

        {/* All Projects listed under the teacher's class*/}
        <List>
          {projects.length === 0 ? ( //If there are no projects in the class project list, give a small message of encouragment
            <Typography variant="h5" align="center" sx={{ marginTop: '100px' }}>
              No Projects Currently in Your Class...
              <br />
              Tell Your Students to Join Up Soon!
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
                  onClick={() => handleShowProjectStatus(project.projectID)} // Show confirmation dialog
                >
                  View Project Status
                </Button>

                <Button
                  variant="contained"
                  sx={{ backgroundColor: '#ffffff', color: '#d30000' }}
                  onClick={() => handleRemoveProject(project.projectID)} // Show confirmation dialog
                >
                  Remove Project
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
            " Project from your class?
            <br />
            <br />
            Please note this cannot be undone
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
        {/* Project Status dialog */}
        <Dialog open={showProjectStatusDialog} onClose={handleExitProjectStaus}>
          <DialogTitle>Project Status</DialogTitle>
          <DialogContent>
            Project status of the "
            {projects.find((project) => project.projectID === selectedProjectId)
              ?.projectName ?? 'No project found'}
            " Project:
            <br />
            {projects.find((project) => project.projectID === selectedProjectId)
              ?.projectStatus ?? 'No project status found'}
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#ffffff', color: '#8B0000' }}
              onClick={handleExitProjectStaus}
            >
              Exit
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ClassDashboard;
