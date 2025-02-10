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
    Chip

} from '@mui/material'
import { MoreVertical } from 'lucide-react';
const FormManagement: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

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
                        label="assigned"
                        color={getStatusChipColor("assigned")}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {/*form.editDate?.toLocaleDateString()*/}
                      Date
                    </TableCell>
                    <TableCell>
                      <IconButton>
                        <MoreVertical size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>

          </TableBody>
        </Table>
      </TableContainer>

    </Box>
    )
}

export default FormManagement;