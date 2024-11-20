import {
  getFirestore,
  query,
  collection,
  where,
  getDocs,
} from 'firebase/firestore';

export async function checkTeacherClassExists(classID: string) {
  try {
    //Ensure the entered code is using uppercase letters
    classID = classID.toUpperCase();
    const db = getFirestore();

    // Create a query to check for the classId
    const q = query(collection(db, 'users'), where('classID', '==', classID));

    // Execute the query
    const querySnapshot = await getDocs(q);

    // If no documents exist, return null or some default value
    if (querySnapshot.empty) {
      return null;
    }

    // Get the matching document and return its lastName field
    const doc = querySnapshot.docs[0];
    return doc.data().lastName;
  } catch (error) {
    console.error('Error checking classId:', error);
    throw error;
  }
}

async function checkClassIDExists(classID: string) {
  try {
    const db = getFirestore();

    //Create a query to check for the classId
    const q = query(collection(db, 'users'), where('classID', '==', classID));

    //Execute the query
    const querySnapshot = await getDocs(q);

    //Return true if any documents exist with this classId
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking classID:', error);
    throw error;
  }
}

export async function generateUniqueClassID() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id;
  do {
    id = '';
    //Generate a 6 char long password from random characters
    for (let i = 0; i < 6; i++) {
      id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  } while (await checkClassIDExists(id)); //Ensure there is no teacher that already has the same code already
  return id;
}
