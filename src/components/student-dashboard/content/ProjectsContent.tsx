import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Collapse,
} from '@mui/material';
import {
  School,
  Users,
  UserPlus,
  LogOut,
  FileText,
  Trash2,
} from 'lucide-react';
import ProjectDocuments from './ProjectDocuments';
import { useAuth } from '../../../contexts/AuthContext';
import { projectsService } from '../../../services/projects.service';
import { Project, ProjectMember } from '../../../types/project.types';
import CreateProjectDialog from './CreateProjectDialog';
import JoinProjectDialog from './JoinProjectDialog';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';

const ProjectsContent: React.FC = () => {
  const { authStatus } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(
    null
  );
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const uid = authStatus.user?.uid;
    if (!uid) return;

    setLoading(true);
    // Subscribe to student's projects
    const unsubscribe = projectsService.subscribeToStudentProjects(
      uid,
      (updatedProjects) => {
        setProjects(updatedProjects);
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [authStatus.user?.uid]);

  const handleCreateProject = () => setCreateDialogOpen(true);
  const handleProjectCreated = () => setCreateDialogOpen(false);
  const handleJoinProject = () => setJoinDialogOpen(true);
  const handleViewDocuments = (project: Project) => {
    setSelectedProject(project);
    setDocumentsDialogOpen(true);
  };

  const handleLeaveProject = async () => {
    if (!selectedProject || !authStatus.user?.uid) return;

    try {
      await projectsService.removeMember(
        selectedProject.id,
        authStatus.user.uid
      );
      setConfirmLeaveOpen(false);
      setSelectedProject(null);
    } catch (err) {
      setError('Failed to leave project');
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedProject || !selectedMember) return;

    try {
      await projectsService.removeMember(
        selectedProject.id,
        selectedMember.userId
      );
      setConfirmRemoveOpen(false);
      setSelectedMember(null);
    } catch (err) {
      setError('Failed to remove team member');
    }
  };

  const isProjectCreator = (project: Project) =>
    project.members.some(
      (member) =>
        member.userId === authStatus.user?.uid && member.role === 'creator'
    );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" color="primary" fontWeight="bold">
          My Projects
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleCreateProject}
            startIcon={<Users />}
          >
            Create New Project
          </Button>
          <Button
            variant="outlined"
            onClick={handleJoinProject}
            startIcon={<UserPlus />}
          >
            Join Project
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              You're not part of any project yet
            </Typography>
            <Typography color="text.secondary" paragraph>
              Create a new project or join an existing one using a project code.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {projects.map((project) => (
            <Card key={project.id}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h5">{project.name}</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      Code: {project.projectCode}
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      project.fairType === 'highSchool'
                        ? 'High School'
                        : 'Middle School'
                    }
                    icon={<School size={16} />}
                    color="primary"
                  />
                </Box>

                <Box
                  onClick={() =>
                    setExpandedProject(
                      expandedProject === project.id ? null : project.id //expands singular project
                    )
                  }
                  sx={{ cursor: 'pointer' }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    Project Info
                    {expandedProject ? (
                      <KeyboardArrowUp />
                    ) : (
                      <KeyboardArrowDown />
                    )}
                  </Typography>
                </Box>

                <Collapse in={expandedProject === project.id}>
                  <List>
                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" gutterBottom>
                      Team Members
                    </Typography>

                    {project.members.map((member) => (
                      <ListItem key={member.userId}>
                        <ListItemText
                          primary={`${member.firstName} ${member.lastName}`}
                          secondary={member.email}
                          secondaryTypographyProps={{
                            component: 'div',
                          }}
                        />
                        {member.role === 'creator' && (
                          <Chip
                            size="small"
                            label="Creator"
                            color="primary"
                            sx={{ mr: 6 }}
                          />
                        )}
                        {isProjectCreator(project) &&
                          member.userId !== authStatus.user?.uid && (
                            <IconButton
                              edge="end"
                              onClick={() => {
                                setSelectedProject(project);
                                setSelectedMember(member);
                                setConfirmRemoveOpen(true);
                              }}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          )}
                      </ListItem>
                    ))}
                  </List>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Adult Sponsor
                    </Typography>
                    <Typography>
                      {project.adultSponsor.name}
                      {project.adultSponsor.isTeacher && (
                        <Chip size="small" label="Teacher" sx={{ ml: 1 }} />
                      )}
                    </Typography>
                    <Typography color="text.secondary">
                      {project.adultSponsor.email}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      mt: 4,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<LogOut />}
                      onClick={() => {
                        setSelectedProject(project);
                        setConfirmLeaveOpen(true);
                      }}
                    >
                      Leave Project
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<FileText />}
                      onClick={() => handleViewDocuments(project)}
                    >
                      Project Documents
                    </Button>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Dialogs */}
      <CreateProjectDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <JoinProjectDialog
        open={joinDialogOpen}
        onClose={() => setJoinDialogOpen(false)}
        onProjectJoined={handleProjectCreated}
      />

      {selectedProject && (
        <>
          <ProjectDocuments
            open={documentsDialogOpen}
            onClose={() => {
              setDocumentsDialogOpen(false);
              setSelectedProject(null);
            }}
            projectId={selectedProject.id}
            projectName={selectedProject.name}
            projectMembers={selectedProject.members}
          />

          <Dialog
            open={confirmLeaveOpen}
            onClose={() => {
              setConfirmLeaveOpen(false);
              setSelectedProject(null);
            }}
          >
            <DialogTitle>Leave Project?</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to leave this project?
                {isProjectCreator(selectedProject) &&
                  ' As the creator, leaving will delete the project if no other members remain.'}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setConfirmLeaveOpen(false);
                  setSelectedProject(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleLeaveProject}
                color="error"
                variant="contained"
              >
                Leave Project
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={confirmRemoveOpen}
            onClose={() => {
              setConfirmRemoveOpen(false);
              setSelectedMember(null);
              setSelectedProject(null);
            }}
          >
            <DialogTitle>Remove Team Member?</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to remove {selectedMember?.firstName}{' '}
                {selectedMember?.lastName} from the project?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setConfirmRemoveOpen(false);
                  setSelectedMember(null);
                  setSelectedProject(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRemoveMember}
                color="error"
                variant="contained"
              >
                Remove
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default ProjectsContent;
