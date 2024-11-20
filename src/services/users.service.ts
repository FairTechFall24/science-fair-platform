import { db } from '../firebase';
import {
  collection,
  query,
  onSnapshot,
  where,
  updateDoc,
  doc,
  Timestamp,
  getDocs,
  QueryConstraint,
  DocumentData,
  getFirestore,
  getDoc,
} from 'firebase/firestore';
import { UserRole } from '../types/auth.types';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: UserRole;
  status: 'active' | 'suspended' | 'inactive';
  registrationDate: Date;
  lastLogin?: Date;
  school?: string;
  grade?: number;
}

// Helper function to convert Firestore data to User type
const convertToUser = (doc: DocumentData): User => {
  const data = doc.data();
  return {
    id: doc.id,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    userType: data.userType,
    status: data.status || 'inactive',
    registrationDate: data.createdAt?.toDate() || new Date(),
    lastLogin: data.lastLogin?.toDate(),
    school: data.school,
    grade: data.grade,
  };
};

export const usersService = {
  subscribeToUsers(callback: (users: User[]) => void) {
    const usersRef = collection(db, 'users');
    return onSnapshot(usersRef, (snapshot) => {
      const users = snapshot.docs.map(convertToUser);
      callback(users);
    });
  },

  async getUsersByRole(role: UserRole): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('userType', '==', role));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(convertToUser);
  },

  async getUsersByRoleAndStatus(
    role: UserRole,
    status: 'active' | 'suspended' | 'inactive'
  ): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const constraints: QueryConstraint[] = [
      where('userType', '==', role),
      where('status', '==', status),
    ];
    const q = query(usersRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(convertToUser);
  },

  async updateUserStatus(
    userId: string,
    status: 'active' | 'suspended' | 'inactive'
  ) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  },

  async updateUserProfile(userId: string, updates: Partial<User>) {
    const userRef = doc(db, 'users', userId);
    const updateData = { ...updates };
    delete updateData.id; // Remove id from updates

    await updateDoc(userRef, {
      ...updateData,
      updatedAt: Timestamp.now(),
    });
  },

  async searchUsers(searchTerm: string): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const searchTermLower = searchTerm.toLowerCase();

    const users = snapshot.docs.map(convertToUser);

    return users.filter((user) => {
      const firstName = user.firstName?.toLowerCase() || '';
      const lastName = user.lastName?.toLowerCase() || '';
      const email = user.email.toLowerCase();

      return (
        firstName.includes(searchTermLower) ||
        lastName.includes(searchTermLower) ||
        email.includes(searchTermLower)
      );
    });
  },

  async getActiveUsersByRole(role: UserRole): Promise<User[]> {
    return this.getUsersByRoleAndStatus(role, 'active');
  },
};

async function getDocumentById(collectionName: string, documentId: string) {
  const db = getFirestore();

  try {
    // Get a reference to the document
    const docRef = doc(db, collectionName, documentId);

    // Fetch the document
    const docSnap = await getDoc(docRef);

    // Check if the document exists
    if (docSnap.exists()) {
      // Return document data
      return {
        ...docSnap.data(),
      };
    } else {
      console.log('No such document exists!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
}

export async function getUsersFullName(userID: string) {
  try {
    const data = await getDocumentById('users', userID);

    if (data === null) {
      throw new Error(`User with ID ${userID} not found`);
    }

    return data.firstName + ' ' + data.lastName;
  } catch (error) {
    console.error('Error getting users full names:', error);
    throw error;
  }
}
