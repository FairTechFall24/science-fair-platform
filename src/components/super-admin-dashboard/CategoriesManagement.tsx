import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Menu,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

import { createCategory, getCategories, deleteCategory } from '../../services/categories.services';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2 } from 'lucide-react';
interface Category {
  id: string;
  name: string;
  description: string;
  highSchool: boolean;
  elementarySchool: boolean;}

const CategoriesManagement: React.FC = () => {
  // Category Details
  const [categoryName, setCategoryName] = useState('');
  const [highSchool, setHighSchool] = useState(false);
  const[highElementary, setHighElementary] = useState(false);
  const [elementarySchool, setElementarySchool] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      const rawData = await getCategories();
  
      const data: Category[] = rawData.map((category: any) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        highSchool: category.highSchool ?? false,
        elementarySchool: category.elementarySchool ?? false, 
      }));
  
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleCreateCategoryDialog = () => {
    setCreateDialogOpen(true);
    setError('');
  };

    const handleCreateCategory = async () => {
    if (!categoryName || !categoryDescription) {
      setError('All fields are required.');
      return;
    }

    if (!highSchool && !elementarySchool) {
      setError('Please select at least one school level.');
      return;
    }

    try {
      const newCategory = {
        name: categoryName,
        description: categoryDescription,
        highSchool,
        elementarySchool,
      };
      console.log("Creating category:", newCategory); // Debugging output

      await createCategory(categoryName, categoryDescription, highSchool, elementarySchool);
 // Ensure `createCategory` accepts an object
      fetchCategories(); // Refresh list
      setCreateDialogOpen(false);
      setCategoryName('');
      setCategoryDescription('');
      setHighSchool(false);
      setElementarySchool(false);
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Failed to create category.');
    }
  };
  const handleOpenDeleteDialog = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setDeleteDialogOpen(true);
  };

  
  // Handles the deletion of a category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete);
      fetchCategories(); // Refresh the list
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Category Management
      </Typography>

      <Button variant="contained" onClick={handleCreateCategoryDialog}>
        Create New Category
      </Button>

      {/* Category Table */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Education Levels</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  {category.highSchool && category.elementarySchool
                    ? 'Both'
                    : category.highSchool
                    ? 'High School'
                    : category.elementarySchool
                    ? 'Elementary School'
                    : 'N/A'}
                </TableCell>


                <TableCell>
                  {/* Delete Button */}
                  <IconButton color="error" onClick={() => handleOpenDeleteDialog(category.id)}>
                    <Trash2 size={20} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Category Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Add a New Category</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Category Name"
            fullWidth
            variant="outlined"
            margin="dense"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            variant="outlined"
            margin="dense"
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
          />
          {/* Checkboxes for School Level */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Applicable to:</Typography>
            <FormControlLabel
              control={<Checkbox checked={highSchool} onChange={() => setHighSchool(!highSchool)} />}
              label="High School"
            />
            <FormControlLabel
              control={<Checkbox checked={elementarySchool} onChange={() => setElementarySchool(!elementarySchool)} />}
              label="Elementary School"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateCategory} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this category?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteCategory} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesManagement;