import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Award, FileText } from 'lucide-react';
import ProjectScoring from './ProjectScoring';
import FormFeedback from './FormFeedback';
import { formsService } from '../../../services/forms.service';
import { judgingService } from '../../../services/judging.service';
import { projectsService } from '../../../services/projects.service';
import { useAuth } from '../../../contexts/AuthContext';
import { FormSubmission } from '../../../types/forms.types';
import { Project } from '../../../types/project.types';
import { ProjectJudgingData } from '../../../types/judging.types';

const FeedbackDashboard: React.FC = () => {
  const { authStatus } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forms, setForms] = useState<FormSubmission[]>([]);
  const [projectScore, setProjectScore] = useState<ProjectJudgingData | null>(
    null
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      if (!authStatus.user?.uid) return;

      try {
        setLoading(true);
        setError(null);

        // Load student's projects
        const userProjects = await projectsService.getStudentProjects(
          authStatus.user.uid
        );
        setProjects(userProjects);

        // Set first project as default selected
        if (userProjects.length > 0) {
          setSelectedProjectId(userProjects[0].id);
        }
      } catch (err) {
        console.error('Error loading feedback data:', err);
        setError('Failed to load feedback data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authStatus.user?.uid]);

  useEffect(() => {
    if (!selectedProjectId) return;

    const subscribeToProjectData = async () => {
      try {
        // Subscribe to project scoring
        const unsubscribeScore = judgingService.subscribeToProjectScores(
          selectedProjectId,
          (data) => {
            setProjectScore(data);
          }
        );

        // Subscribe to forms
        const unsubscribeForms = formsService.subscribeToProjectForms(
          selectedProjectId,
          (updatedForms) => {
            setForms(updatedForms);
          }
        );

        return () => {
          unsubscribeScore();
          unsubscribeForms();
        };
      } catch (err) {
        console.error('Error subscribing to project data:', err);
        setError('Failed to load project data. Please try again.');
      }
    };

    subscribeToProjectData();
  }, [selectedProjectId]);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className="mb-4">
        {error}
      </Alert>
    );
  }

  if (projects.length === 0) {
    return (
      <Alert severity="info" className="mb-4">
        You need to create or join a project to see feedback.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" color="primary" className="mb-6">
        Project Feedback
      </Typography>

      <FormControl fullWidth className="mb-4" sx={{ mt: 2 }}>
        <InputLabel>Select Project</InputLabel>
        <Select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          label="Select Project"
        >
          {projects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        className="mb-6"
      >
        <Tab
          icon={<Award className="w-4 h-4" />}
          label="Project Score"
          iconPosition="start"
        />
        <Tab
          icon={<FileText className="w-4 h-4" />}
          label="Form Reviews"
          iconPosition="start"
        />
      </Tabs>

      {activeTab === 0 ? (
        <ProjectScoring projectScore={projectScore} />
      ) : (
        <Box className="space-y-4">
          {forms.length === 0 ? (
            <Alert severity="info">
              No forms submitted yet. Submit your forms to receive feedback.
            </Alert>
          ) : (
            forms.map((form) => <FormFeedback key={form.id} form={form} />)
          )}
        </Box>
      )}
    </Box>
  );
};

export default FeedbackDashboard;
