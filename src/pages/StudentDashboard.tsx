import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Sidebar from '../components/student-dashboard/Sidebar';
import ProjectsContent from '../components/student-dashboard/content/ProjectsContent';
import AccountSettingsContent from '../components/student-dashboard/content/AccountSettingsContent';
import FormQuestions from '../components/student-dashboard/content/FormQuestions';
import FeedbackDashboard from '../components/student-dashboard/content/FeedbackDashboard';
import { ContentType } from '../types/studentDashboard';
import { useAuth } from '../contexts/AuthContext';
import { formsService } from '../services/forms.service';
import { projectsService } from '../services/projects.service';

const StudentDashboard: React.FC = () => {
  const [activeContent, setActiveContent] = useState<ContentType>('projects');
  const [pendingFormsCount, setPendingFormsCount] = useState<number>(0);
  const [newFeedbackCount, setNewFeedbackCount] = useState<number>(0);
  const [unsubscribeFunctions, setUnsubscribeFunctions] = useState<
    (() => void)[]
  >([]);
  const { authStatus } = useAuth();

  useEffect(() => {
    // Cleanup function to unsubscribe from all subscriptions
    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  }, [unsubscribeFunctions]);

  useEffect(() => {
    // Early return if there's no authenticated user
    if (!authStatus.user?.uid) {
      setPendingFormsCount(0);
      setNewFeedbackCount(0);
      return;
    }

    const userId = authStatus.user.uid;

    const loadCounts = async () => {
      try {
        // Unsubscribe from existing subscriptions
        unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());

        // Get student's projects
        const projects = await projectsService.getStudentProjects(userId);
        const newUnsubscribeFunctions: (() => void)[] = [];

        let totalPendingForms = 0;
        let totalNewFeedback = 0;

        // Subscribe to forms for each project
        projects.forEach((project) => {
          const unsubscribeForms = formsService.subscribeToProjectForms(
            project.id,
            (forms) => {
              const pendingCount = forms.filter(
                (form) => form.status === 'needs_revision'
              ).length;

              const feedbackCount = forms.filter(
                (form) =>
                  form.status === 'in_review' ||
                  form.versions[form.currentVersion].reviews.length > 0
              ).length;

              totalPendingForms += pendingCount;
              totalNewFeedback += feedbackCount;

              setPendingFormsCount(totalPendingForms);
              setNewFeedbackCount(totalNewFeedback);
            }
          );

          newUnsubscribeFunctions.push(unsubscribeForms);
        });

        setUnsubscribeFunctions(newUnsubscribeFunctions);
      } catch (error) {
        console.error('Error loading counts:', error);
        setPendingFormsCount(0);
        setNewFeedbackCount(0);
      }
    };

    loadCounts();
  }, [authStatus.user?.uid]);

  const renderContent = () => {
    switch (activeContent) {
      case 'form-questionnaire':
        return <FormQuestions />;
      case 'projects':
        return <ProjectsContent />;
      case 'settings':
        return <AccountSettingsContent />;
      case 'feedback':
        return <FeedbackDashboard />;
      default:
        return <ProjectsContent />;
    }
  };

  if (authStatus.isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        activeContent={activeContent}
        onContentChange={setActiveContent}
        pendingFormsCount={pendingFormsCount}
        newFeedbackCount={newFeedbackCount}
      />
      <Box sx={{ flexGrow: 1, padding: 4 }}>{renderContent()}</Box>
    </Box>
  );
};

export default StudentDashboard;
