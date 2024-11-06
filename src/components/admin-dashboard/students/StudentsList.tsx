import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { Student } from '../../../types/student.types';
import { studentsService } from '../../../services/students.service';

interface StudentsListProps {
  onViewStudent: (student: Student) => void;
}

const StudentsList: React.FC<StudentsListProps> = ({ onViewStudent }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = studentsService.subscribeToStudents(
      (updatedStudents) => {
        setStudents(updatedStudents);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredStudents = students.filter(
    (student) =>
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5">Students Management</Typography>
        <TextField
          size="small"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>School</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell align="center">Forms</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  {student.firstName} {student.lastName}
                </TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.school}</TableCell>
                <TableCell>{student.grade}</TableCell>
                <TableCell align="center">
                  <Box
                    sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}
                  >
                    <Chip
                      label={`Total: ${student.formSubmissions?.total || 0}`}
                      size="small"
                    />
                    <Chip
                      label={`Pending: ${student.formSubmissions?.pending || 0}`}
                      color="warning"
                      size="small"
                    />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={student.status}
                    color={student.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => onViewStudent(student)}
                  >
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StudentsList;
