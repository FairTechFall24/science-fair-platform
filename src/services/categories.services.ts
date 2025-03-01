import { db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  orderBy,
} from 'firebase/firestore';
import { Category } from '../types/categories.types';


// Function to create a new category in Firestore
export async function createCategory(
  name: string,
  description: string,
  isHighSchool: boolean,
  isElementary: boolean
): Promise<Category> {
  const categoryData: Omit<Category, 'id'> = {
    name, description, isHighSchool, isElementary
  };

  try {
    const docRef = await addDoc(collection(db, 'categories'), categoryData);
    console.log('✅ Category created with ID:', docRef.id);

    return { id: docRef.id, ...categoryData };
  } catch (error) {
    console.error('❌ Error creating category:', error);
    throw new Error('Failed to create category.');
  }
}

// Function to fetch all categories from Firestore
export async function getCategories(): Promise<Category[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Category, 'id'>),
    })) as Category[];
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    throw new Error('Failed to fetch categories.');
  }
}
// function to delete cataegory from Firestore
export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await deleteDoc(categoryRef);
    console.log(`✅ Category with ID ${categoryId} deleted successfully.`);
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    throw new Error('Failed to delete category.');
  }
}