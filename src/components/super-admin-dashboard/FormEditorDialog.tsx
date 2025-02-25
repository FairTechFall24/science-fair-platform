import React, { useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { CircleCheckBig } from 'lucide-react';

interface FormEditorDialogProps {
  open: boolean;
  onClose: () => void;
}

const FormEditorDialog: React.FC<FormEditorDialogProps> = ({
  open,
  onClose,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setUploading] = useState(false);
  const [PDFURL, setPDFURL] = useState<string>(
    'https://sspcdn.blob.core.windows.net/files/Documents/SEP/ISEF/2025/Forms/1A-Student-Checklist.pdf'
  );

  const loadPDF = async (url: string) => {
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
    return <iframe src={url} />;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      const blob = new Blob([event.target.files[0]], {
        type: 'application/pdf',
      });
      setPDFURL(URL.createObjectURL(blob));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);
    } catch (err) {
      setError('Failed to upload form. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth={true}>
      <DialogTitle>Join Project</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <div style={{ display: 'flex' }}>
          <div style={{ flex: '0 0 70%' }}>
            <Paper sx={{ mb: 3, p: 2 }} style={{ border: '1px solid #ccc' }}>
              <div style={{ height: '600px' }}>
                <iframe width="1000" height="600" src={PDFURL} />
              </div>
            </Paper>
          </div>
          <div style={{ flex: '1' }}>
            <Paper sx={{ mb: 3, p: 2 }} style={{ border: '1px solid #ccc' }}>
              <div style={{ height: '600px', overflow: 'auto' }}>
                <QuestionCard
                  index="1"
                  question="Project Leader's Name"
                  answerText="Name"
                />
                <MultChoiceQuestionCard
                  index="2"
                  question="Multiple Choice Test"
                  answerText1="Option 1"
                  answerText2="Option 2"
                />
                <QuestionCard
                  index="3"
                  question="Project Start Date"
                  answerText="Date"
                />
                <Button variant="contained" fullWidth>
                  Add Question
                </Button>
              </div>
            </Paper>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          component="label"
          disabled={isUploading}
          onClick={handleUpload}
        >
          {isUploading ? 'Uploading...' : 'Upload PDF'}
          <input type="file" hidden accept=".pdf" onChange={handleFileSelect} />
        </Button>
        <Button variant="contained">Save as draft</Button>
        <Button variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

interface QuestionCardProps {
  index: string;
  question: string;
  answerText: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  index,
  question,
  answerText,
}) => {
  return (
    <Paper sx={{ mb: 1, p: 2 }} style={{ border: '1px solid #ccc' }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h5" gutterBottom textAlign={'center'}>
          Question {index}
        </Typography>
        <Typography variant="body1" gutterBottom textAlign={'center'}>
          {question}
        </Typography>
        <Paper sx={{ mb: 1, p: 2 }} style={{ border: '1px solid #ccc' }}>
          {answerText}
        </Paper>
      </Box>
    </Paper>
  );
};

interface MultChoiceQuestionCardProps {
  index: string;
  question: string;
  answerText1: string;
  answerText2: string;
}

const MultChoiceQuestionCard: React.FC<MultChoiceQuestionCardProps> = ({
  index,
  question,
  answerText1,
  answerText2,
}) => {
  return (
    <Paper sx={{ mb: 1, p: 2 }} style={{ border: '1px solid #ccc' }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h5" gutterBottom textAlign={'center'}>
          Question {index}
        </Typography>
        <Typography variant="body1" gutterBottom textAlign={'center'}>
          {question}
        </Typography>
        <Paper sx={{ mb: 1, p: 2 }} style={{ border: '1px solid #ccc' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: '0 0 10%' }}>
              <CircleCheckBig />
            </div>
            <div style={{ flex: '1' }}>{answerText1}</div>
          </div>
        </Paper>
        <Paper sx={{ mb: 1, p: 2 }} style={{ border: '1px solid #ccc' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: '0 0 10%' }}>
              <CircleCheckBig />
            </div>
            <div style={{ flex: '1' }}>{answerText2}</div>
          </div>
        </Paper>
      </Box>
    </Paper>
  );
};

export default FormEditorDialog;
