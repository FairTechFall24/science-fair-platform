import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

async function checkClassIDExists(classID) {
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

async function generateUniqueClassID() {
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

export default generateUniqueClassID;
