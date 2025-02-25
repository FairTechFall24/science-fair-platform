import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  TableCell,
  Table,
  TableHead,
  TableRow,
  TableBody,
  IconButton,
  Chip,
  Menu,
} from '@mui/material';
import { MoreVertical, Pen, Ban } from 'lucide-react';
import FormEditorDialog from './FormEditorDialog';

const FormManagement: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [formDialogOpen, setformDialogOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'success';
      case 'drafted':
        return 'error';
      case 'archived':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Form Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
      {/* Filters section */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            label="Search forms"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="assigned">Assigned</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                {/*{form.name}*/}
                Test Form
              </TableCell>
              <TableCell>
                <Chip
                  label="Draft"
                  color={getStatusChipColor('drafted')}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {/*form.editDate?.toLocaleDateString()*/}
                Date
              </TableCell>
              <TableCell>
                <IconButton onClick={(e) => handleMenuOpen(e)}>
                  <MoreVertical size={18} />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={(e) => setformDialogOpen(true)}>
          <Pen size={18} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem>
          <Ban size={18} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      <FormEditorDialog
        open={formDialogOpen}
        onClose={() => setformDialogOpen(false)}
      />
    </Box>
  );
};

export default FormManagement;
