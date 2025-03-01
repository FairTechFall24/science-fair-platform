import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  AppBar,
  Toolbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { styled } from '@mui/system';
import { useAuth } from '../contexts/AuthContext';
import LogoutButton from '../components/LogoutButton';
import { Category } from '../types/categories.types';
import { getCategories } from '../services/categories.services';
import { testWrite } from '../services/test';


const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  zipCode: Yup.string()
    .matches(/^[0-9]{5}$/, 'Zip code must be 5 digits')
    .required('Zip code is required'),
  categories: Yup.array().min(1, 'At least one category must be selected'),
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(6),
  },
}));

const StyledForm = styled(Form)({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

const JudgeRegistration: React.FC = () => {
  const { authStatus, completeRegistration } = useAuth();
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const initialValues = {
    firstName: Yup.string,
    lastName: Yup.string,
    phone: Yup.string,
    address: '',
    city: '',
    state: '',
    zipCode: '',
    category: [] as string[],
    categories: [] as string[],
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      setRegistrationError(null);

      if (!authStatus.user) {
        throw new Error('User not authenticated');
      }

      const registrationData = {
        ...values,
        userType: 'judge',
      };

      await completeRegistration(registrationData);
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationError('An error occurred during registration. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            Judge Registration
          </Typography>
          <LogoutButton />
        </Toolbar>
      </AppBar>
      <Box sx={{ maxWidth: 600, margin: 'auto', mt: 4, px: 2 }}>
        <StyledPaper elevation={3}>
          <Typography variant="h4" gutterBottom align="center" color="primary">
            Complete Your Registration
          </Typography>

          {registrationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {registrationError}
            </Alert>
          )}

          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ errors, touched, isSubmitting, values, setFieldValue }) => (
              <StyledForm>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="firstName"
                      label="First Name"
                      error={touched.firstName && Boolean(errors.firstName)}
                      helperText={touched.firstName && errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="lastName"
                      label="Last Name"
                      error={touched.lastName && Boolean(errors.lastName)}
                      helperText={touched.lastName && errors.lastName}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="phone"
                      label="Phone Number"
                      error={touched.phone && Boolean(errors.phone)}
                      helperText={touched.phone && errors.phone}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="address"
                      label="Address"
                      error={touched.address && Boolean(errors.address)}
                      helperText={touched.address && errors.address}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="city"
                      label="City"
                      error={touched.city && Boolean(errors.city)}
                      helperText={touched.city && errors.city}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="state"
                      label="State"
                      error={touched.state && Boolean(errors.state)}
                      helperText={touched.state && errors.state}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="zipCode"
                      label="Zip Code"
                      error={touched.zipCode && Boolean(errors.zipCode)}
                      helperText={touched.zipCode && errors.zipCode}
                    />
                  </Grid>

                  {/* Multiple Category Selection using Checkboxes */}
                  <Grid item xs={8}> 
                    <InputLabel id="categories-label">Select Categories</InputLabel>
                  </Grid>
                  <Grid item xs={12}>
                  <FormControl fullWidth>
                    <Select
                      multiple
                      value={values.categories}
                      onChange={(e) => setFieldValue('categories', e.target.value)}
                      renderValue={(selected) => 
                        categories
                          .filter((category) => selected.includes(category.id))
                          .map((category) => category.name)
                          .join(', ')
                      }
                    >
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            <Checkbox checked={values.categories.includes(category.id)} />
                            {category.name} 
                            {category.isHighSchool ? ' - High School' : ''} 
                            {category.isElementary ? ' - Elementary School' : ''}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No Categories Available</MenuItem>
                      )}
                    </Select>
                    {touched.categories && errors.categories && (
                      <Alert severity="error">{errors.categories}</Alert>
                    )}
                  </FormControl>
                </Grid>
                </Grid>
                <Grid item xs={12}> 
                  <Typography variant="subtitle1" color="text.secondary">
                    By clicking "Complete Registration", you agree to our Terms of Service and Privacy Policy.
                  </Typography>
                </Grid>
                <Box sx={{ mt: 3 }}>
                  <Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                  </Button>
                </Box>
              </StyledForm>
            )}
          </Formik>
        </StyledPaper>
      </Box>
    </>
  );
};

export default JudgeRegistration;