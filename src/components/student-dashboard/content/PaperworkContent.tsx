import React from 'react';
import {
  Box,
  Typography,
  Button,
  Input,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

import { useFileUpload } from '../../../hooks/useFileUpload';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { FormSubmission } from '../../../types/forms.types';


const PaperworkContent: React.FC = () => {
  const {
    selectedFile,
    isUploading,
    uploadStatus,
    errorMessage,
    submissions,
    handleFileChange,
    handleUpload,
  } = useFormUpload();

  const getStatusColor = (status: FormSubmission['status']) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'needs_revision':
        return 'warning';
      default:
        return 'default';
    }
  };

  const navigate = useNavigate();
  const auth = getAuth();

  const handleGoToQuestionnaire = () => {
    navigate('/form-questionnaire');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Typography variant="h4" gutterBottom>

        PaperWork
      </Typography>

      <Typography
        variant="h5"
        align="justify"
        sx={{ marginTop: 1, width: '80%', maxWidth: '500px' }}
      >
        Not sure what documents you need? Complete the{' '}
        <strong>Form Questionnaire</strong> to get a customized list.
        <br />
      </Typography>
      <Typography
        variant="h5"
        align="center"
        sx={{ marginTop: 1, width: '80%', maxWidth: '500px' }}
      >
        Click here to get the Form Questionnaire.
        <br />
        <br />
        <Button
          variant="contained"
          color="primary"
          onClick={handleGoToQuestionnaire}
          sx={{
            backgroundColor: '#512da8',
            marginRight: 2,
            fontSize: '1.5rem',
            padding: '12px 24px',
            width: '50%',
            height: '80px',
            '&:hover': { backgroundColor: '#4527a0' },
          }}
        >
          Form Questionnaire
        </Button>
      </Typography>
      <br />
      <Typography
        variant="h5"
        align="center"
        sx={{ marginTop: 1, width: '80%', maxWidth: '500px' }}
      >
        If your project conditions have changed, you can retake the
        questionnaire anytime by going to the Form Questionnaire under
        paperwork.

      </Typography>
      <br />
      <br />
      <Typography
        variant="h5"
        align="center"
        sx={{ marginTop: 1, width: '80%', maxWidth: '500px' }}
      >
        To track the review status of your uploaded files, visit{' '}
        <strong>My Documents</strong> under Paperwork.
      </Typography>

      {!auth.currentUser && (
        <Alert
          severity="warning"
          sx={{ marginTop: 4, width: '80%', maxWidth: '500px' }}
        >
          Please login to upload files.
        </Alert>
      )}

      {auth.currentUser && !auth.currentUser.emailVerified && (
        <Alert
          severity="warning"
          sx={{ marginTop: 4, width: '80%', maxWidth: '500px' }}
        >
          Please verify your email before uploading files.
        </Alert>
      )}


      <Box
        sx={{
          marginTop: 4,
          textAlign: 'center',
          width: '80%',
          maxWidth: '500px',
        }}
      >
        <Input
          type="file"
          onChange={handleFileChange}
          sx={{ display: 'none' }}
          id="pdf-upload-input"
          inputProps={{ accept: '.pdf' }}
        />
        <label htmlFor="pdf-upload-input">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUploadIcon />}
            sx={{
              backgroundColor: '#512da8',
              marginRight: 2,
              fontSize: '1.5rem',
              padding: '12px 24px',
              width: '50%',
              height: '70px',
              '&:hover': { backgroundColor: '#4527a0' },
            }}
          >
            Select PDF
          </Button>
        </label>
        {selectedFile && (
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            Selected file: {selectedFile.name}
          </Typography>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ marginTop: 2 }}>
            {errorMessage}
          </Alert>
        )}
      </Box>


        <Button
          variant="contained"
          onClick={handleUpload}

          disabled={
            !selectedFile ||
            isUploading ||
            !auth.currentUser ||
            !auth.currentUser.emailVerified
          }
          sx={{
            backgroundColor: '#512da8',
            width: '100%',
            height: '60px',
            alignItems: 'center',
          }}

        >
          {isUploading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Upload Form'
          )}
        </Button>

        {errorMessage && (
          <Alert severity="error" sx={{ maxWidth: '500px' }}>
            {errorMessage}
          </Alert>
        )}

        {uploadStatus === 'success' && (
          <Alert severity="success" sx={{ maxWidth: '500px' }}>
            Form uploaded successfully! It will be reviewed shortly.
          </Alert>
        )}
      </Box>

      {/* Submissions List */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Your Submissions
        </Typography>
        <List>
          {submissions.map((submission) => (
            <ListItem
              key={submission.id}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <ListItemText
                primary={submission.fileName}
                secondary={`Submitted: ${submission.uploadDate.toLocaleDateString()}`}
              />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Chip
                  label={submission.status.replace('_', ' ')}
                  color={getStatusColor(submission.status)}
                  size="small"
                />
                {submission.comments && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {submission.comments}
                  </Typography>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default PaperworkContent;
