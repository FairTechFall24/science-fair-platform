import React, { useState } from 'react';
import {
  TextField,
  Button,
  Tab,
  Tabs,
  Box,
  Divider,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebase';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AuthPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const { signIn, signUp } = useAuth();
  const emailRegExpression = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //email format

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    nonAlphanumeric: false,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setPasswordRequirements({
      length: false,
      lowercase: false,
      uppercase: false,
      nonAlphanumeric: false,
    });
    setShowPasswordRequirements(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      // AuthContext will handle the navigation based on user state
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!Object.values(passwordRequirements).every(Boolean)) {
      setError("Password doesn't meet all requirements.");
      return;
    }
    try {
      await signUp(email, password);
      setMessage(
        'A verification email has been sent. Please check your inbox.'
      );
    } catch (error) {
      setError('Registration failed. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // AuthContext will handle the navigation based on user state
    } catch (error) {
      setError('Google sign-in failed');
    }
  };

  const checkPasswordRequirements = (password: string) => {
    setPasswordRequirements({
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      nonAlphanumeric: /[^a-zA-Z0-9]/.test(password),
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordRequirements(newPassword);
  };

  const handlePasswordFocus = () => {
    setShowPasswordRequirements(true);
  };

  const handlePasswordBlur = () => {
    setShowPasswordRequirements(false);
  };

  const handleForgotPassword = async () => {
    //Uses Firestore's build in function to email user with reset link
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert('A Password Reset Link has been sent to your email');
      })
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
      });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 400, margin: 'auto', mt: 4 }}>
      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab label="Login" />
        <Tab label="Sign Up" />
      </Tabs>

      {error && (
        <Box sx={{ color: 'error.main', textAlign: 'center', mt: 2 }}>
          <Typography variant="body1">{error}</Typography>
        </Box>
      )}

      {message && (
        <Box sx={{ color: 'success.main', textAlign: 'center', mt: 2 }}>
          <Typography variant="body1">{message}</Typography>
        </Box>
      )}

      <TabPanel value={tabValue} index={0}>
        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />
          {emailRegExpression.test(email) && ( //reset password only appears if email is correctly formatted
            <Box>
              <Tabs
                onChange={handleForgotPassword}
                centered
                style={{ height: 5, margin: -10 }}
              >
                <Tab label="Forget Password?" />
              </Tabs>
            </Box>
          )}
          <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>
            Login
          </Button>
        </form>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <form onSubmit={handleSignup}>
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onFocus={handlePasswordFocus}
            onBlur={handlePasswordBlur}
            margin="normal"
          />
          <Collapse in={showPasswordRequirements}>
            <List dense>
              {Object.entries(passwordRequirements).map(([key, met]) => (
                <ListItem key={key}>
                  <ListItemIcon>
                    {met ? (
                      <CheckCircleOutlineIcon color="success" />
                    ) : (
                      <ErrorOutlineIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      key === 'length'
                        ? 'At least 6 characters'
                        : key === 'lowercase'
                          ? 'Contains lowercase letter'
                          : key === 'uppercase'
                            ? 'Contains uppercase letter'
                            : 'Contains non-alphanumeric character'
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
          />
          <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>
            Sign Up
          </Button>
        </form>
      </TabPanel>

      <Divider sx={{ my: 3 }}>OR</Divider>

      <Button
        fullWidth
        variant="outlined"
        onClick={handleGoogleSignIn}
        sx={{ mt: 2 }}
      >
        Sign in with Google
      </Button>
    </Box>
  );
};

export default AuthPage;
