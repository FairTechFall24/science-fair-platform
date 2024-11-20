import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { getUsersFullName } from './users.service';

async function formatProjectMembers(
  member1: string,
  member2: string,
  member3: string
) {
  const names = [member1, member2, member3].filter((name) => name !== 'n/a');

  for (let i = 0; i < names.length; i++) {
    names[i] = await getUsersFullName(names[i]);
  }

  if (names.length === 1) {
    return names[0] + "'s Project";
  } else {
    const lastIndex = names.length - 1;
    return (
      names.slice(0, lastIndex).join(', ') +
      ' & ' +
      names[lastIndex] +
      "'s Project"
    );
  }
}

export async function getTeacherDashboardProjects(classID: any) {
  try {
    const db = getFirestore();

    // Create a query to check for the classID
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('classID', '==', classID));
    // Execute the query
    const querySnapshot = await getDocs(q);

    // If no documents exist, return null or some default value
    if (querySnapshot.empty) {
      console.log('--No projects found--');
      return null;
    }

    // Get the matching document and return its lastName field
    const userProjects = querySnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        projectID: doc.id,
        projectName: data.projectName || 'Unnamed Project Name',
        projectStatus: data.projectStatus || 'Unknown Status',
        projectMembers: formatProjectMembers(
          data.projectMember1ID,
          data.projectMember2ID,
          data.projectMember3ID
        ),
      };
    });

    return userProjects;
  } catch (error) {
    console.error('Error finding projects:', error);
    throw error;
  }
}

export async function getStudentDashboardProjects(studentID: any) {
  try {
    const db = getFirestore();

    // Create a query to check for the userID
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('projectMember1ID', '==', studentID));
    // Execute the query
    const querySnapshot = await getDocs(q);

    // If no documents exist, return null or some default value
    if (querySnapshot.empty) {
      console.log('--No projects found--');
      return null;
    }

    // Get the matching document and return its lastName field
    const userProjects = querySnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        projectID: doc.id,
        projectName: data.projectName || 'Unnamed Project Name',
        projectStatus: data.projectStatus || 'Unknown Status',
        projectMembers: formatProjectMembers(
          data.projectMember1ID,
          data.projectMember2ID,
          data.projectMember3ID
        ),
      };
    });

    return userProjects;
  } catch (error) {
    console.error('Error finding projects:', error);
    throw error;
  }
}

export async function removeClassCodeFromProject(projectID: any) {
  // Initialize Firestore
  const db = getFirestore();

  // Reference the document you want to update
  const docRef = doc(db, 'projects', projectID);

  // Data to update
  const updatedData = {
    classID: 'n/a',
  };

  // Update the document
  updateDoc(docRef, updatedData)
    .then(() => {
      console.log('Document updated successfully!');
    })
    .catch((error) => {
      console.error('Error updating document:', error);
    });
}

export async function removeProjectFromStudent(projectID: any, studentID: any) {
  // Initialize Firestore
  const db = getFirestore();

  // Reference the document you want to update
  const docRef = doc(db, 'projects', projectID);

  try {
    // Get the document snapshot
    const docSnapshot = await getDoc(docRef);

    // Check if the document exists
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();

      let updatedData = {};

      // Check if the studentID is in any of the userId fields
      if (data.projectMember1ID === studentID) {
        updatedData = {
          projectMember1ID: 'n/a',
        };
      } else if (data.projectMember2ID === studentID) {
        updatedData = {
          projectMember2ID: 'n/a',
        };
      } else if (data.projectMember3ID === studentID) {
        updatedData = {
          projectMember3ID: 'n/a',
        };
      }

      // Update the document
      await updateDoc(docRef, updatedData)
        .then(() => {
          console.log('Document updated successfully!');
        })
        .catch((error) => {
          console.error('Error updating document:', error);
        });
    }
  } catch (error) {
    console.error('Error in removeProjectFromStudent:', error);
    throw error;
  }
}

export async function deleteProject(projectID: any) {
  // Initialize Firestore
  const db = getFirestore();

  // Reference the document you want to update
  const docRef = doc(db, 'projects', projectID);

  // Get the updated document to check current state
  const docSnapshot = await getDoc(docRef);
  if (docSnapshot.exists()) {
    const data = docSnapshot.data();
    if (
      data.projectMember1ID === 'n/a' &&
      data.projectMember2ID === 'n/a' &&
      data.projectMember3ID === 'n/a'
    ) {
      // Delete the document
      await deleteDoc(docRef);
      console.log('Document deleted successfully!');
    }
  }
}
