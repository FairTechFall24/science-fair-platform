import { db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  QuerySnapshot,
  DocumentData,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { Student } from '../types/student.types';
import { projectsService } from '../services/projects.service';
import { FormSubmission } from '../types/forms.types';

// Helper function to get form statistics
const calculateFormStats = (forms: FormSubmission[]) => {
  return forms.reduce(
    (acc, form) => {
      acc.total++;
      switch (form.status) {
        case 'pending':
          acc.pending++;
          break;
        case 'approved':
          acc.approved++;
          break;
        case 'rejected':
          acc.rejected++;
          break;
        case 'needs_revision':
          acc.needsRevision++;
          break;
      }
      return acc;
    },
    {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      needsRevision: 0,
    }
  );
};

// Helper to convert Firestore data to Student type
const convertToStudent = async (doc: DocumentData): Promise<Student> => {
  const data = doc.data();

  // Get forms for this student
  const formsRef = collection(db, 'forms');
  const formsQuery = query(formsRef, where('studentId', '==', doc.id));
  const formsSnapshot = await getDocs(formsQuery);
  const forms = formsSnapshot.docs.map((formDoc) => ({
    ...formDoc.data(),
    id: formDoc.id,
    uploadDate: formDoc.data().uploadDate.toDate(),
    lastUpdated: formDoc.data().lastUpdated.toDate(),
  })) as FormSubmission[];

  // Calculate form statistics
  const formStats = calculateFormStats(forms);

  return {
    id: doc.id,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    school: data.school || '',
    grade: data.grade || 0,
    status: data.status || 'inactive',
    registrationDate:
      data.registrationCompletedAt?.toDate() ||
      data.createdAt?.toDate() ||
      new Date(),
    formSubmissions: formStats,
  };
};

export const studentsService = {
  subscribeToStudents(callback: (students: Student[]) => void) {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('userType', '==', 'student'));

    return onSnapshot(q, async (snapshot: QuerySnapshot<DocumentData>) => {
      // Convert all documents to Students with form stats
      const studentsPromises = snapshot.docs.map(convertToStudent);
      const students = await Promise.all(studentsPromises);

      callback(students);
    });
  },

  async getStudentForms(studentId: string): Promise<FormSubmission[]> {
    const formsRef = collection(db, 'forms');
    const formsQuery = query(formsRef, where('studentId', '==', studentId));
    const formsSnapshot = await getDocs(formsQuery);

    return formsSnapshot.docs.map((formDoc) => {
      const data = formDoc.data();
      return {
        id: formDoc.id,
        ...data,
        uploadDate: data.uploadDate.toDate(),
        lastUpdated: data.lastUpdated.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        versions: data.versions.map((version: any) => ({
          ...version,
          uploadedAt: version.uploadedAt.toDate(),
          reviews: version.reviews.map((review: any) => ({
            ...review,
            timestamp: review.timestamp.toDate(),
          })),
        })),
      } as FormSubmission;
    });
  },

  async getActiveStudents(): Promise<Student[]> {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('userType', '==', 'student'),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);

    const studentsPromises = snapshot.docs.map(convertToStudent);
    return Promise.all(studentsPromises);
  },

  async getStudentsBySchool(school: string): Promise<Student[]> {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('userType', '==', 'student'),
      where('school', '==', school)
    );
    const snapshot = await getDocs(q);

    const studentsPromises = snapshot.docs.map(convertToStudent);
    return Promise.all(studentsPromises);
  },

  async getStudentsByGrade(grade: number): Promise<Student[]> {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('userType', '==', 'student'),
      where('grade', '==', grade)
    );
    const snapshot = await getDocs(q);

    const studentsPromises = snapshot.docs.map(convertToStudent);
    return Promise.all(studentsPromises);
  },

  //Deletes all data from a students account including removing them from any projects
  async deleteStudentAccount(studentId: string) {
    try {
      //Collect all projects where the student is a member
      const projects = await projectsService.getStudentProjects(studentId);
      //Loop through each project(s) and remove the user from the project (set status to pending_purge if only member on project)
      for (let i = 0; i < projects.length; i++) {
        await projectsService.removeMember(projects[i].id, studentId);
      }
    } catch (error) {
      console.error('Error removing student from project document(s):', error);
      throw error;
    }

    try {
      //delete the student's document
      await deleteDoc(doc(db, 'users', studentId));
    } catch (error) {
      console.error('Error deleting student user document:', error);
      throw error;
    }
  },
};
