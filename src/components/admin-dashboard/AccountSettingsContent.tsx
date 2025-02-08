import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContentText,
} from '@mui/material';
import { UserRoundX, UserRoundPen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usersService } from '../../services/users.service';

const AccountSettingsContent: React.FC = () => {
  const { authStatus } = useAuth();
  const userData = authStatus.metadata || {};
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false);

  const deleteAccount = async (): Promise<void> => {
    //Close Dialog Window
    setDeletionDialogOpen(false);
    //If user is authenticated, allow the user to delete their account and other data
    if (authStatus.user) {
      await usersService.deleteUserAccount(authStatus.user.uid);
      //Reload the page to send user back to login screen
      window.location.reload();
    }
  };

  const openConfirmDeletionDialog = () => {
    //Opens up dialog window to confirm user wants to delete their account & data
    setDeletionDialogOpen(true);
  };

  //format phone number for readability
  function formatPhoneNumber(phoneNumber: string): string {
    //if no phone number, return blank string
    if (!phoneNumber) return '';
    //Remove all non-digits and spilt phone number
    const cleaned = phoneNumber.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    //match groups to correct spots
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    //Return original if match failed (not correct amount of digits)
    return phoneNumber;
  }

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
        Account Settings
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={userData.firstName || ''}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={userData.lastName || ''}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={authStatus.user?.email || ''}
              disabled
            />
          </Grid>
          {userData.phone !== undefined && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formatPhoneNumber(userData.phone)}
                disabled
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
              startIcon={<UserRoundPen />}
            >
              {/* Not implemented */}
              Update Account Info
            </Button>
            <Button
              variant="outlined"
              color="error"
              sx={{ mr: 2 }}
              startIcon={<UserRoundX />}
              onClick={openConfirmDeletionDialog}
            >
              Delete Account
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Action Dialog */}
      <Dialog
        open={deletionDialogOpen}
        onClose={() => setDeletionDialogOpen(false)}
      >
        <DialogTitle>Delete Account and Data</DialogTitle>
        <DialogContentText sx={{ m: 2 }}>
          <Box>
            <Typography>
              Are you sure you want to delete your account? <br /> This cannot
              be undone and you will lose all progress.
            </Typography>
          </Box>
        </DialogContentText>
        <DialogActions>
          <Button onClick={() => setDeletionDialogOpen(false)}>Cancel</Button>
          <Button onClick={deleteAccount} variant="contained" color="error">
            Confirm Deletion
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountSettingsContent;
