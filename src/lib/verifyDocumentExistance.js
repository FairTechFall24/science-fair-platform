import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

async function checkTeacherClassExists(classID) {
  try {
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

export default checkTeacherClassExists;
