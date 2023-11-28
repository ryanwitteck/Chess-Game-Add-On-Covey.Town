import firebase from 'firebase/compat/app';
import 'firebase/firestore';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  increment,
  orderBy,
  limit,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';

import { initializeApp } from 'firebase/app';

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
  apiKey: 'AIzaSyCnHjG0ewAzWxGqlAOVDO9DVUGWTs8pVEs',
  authDomain: 'cs4530-final-project.firebaseapp.com',
  projectId: 'cs4530-final-project',
  storageBucket: 'cs4530-final-project.appspot.com',
  messagingSenderId: '240965719440',
  appId: '1:240965719440:web:639020f76ec2c1b6358f15',
  measurementId: 'G-HXTPJ5FP3K',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service

const db = getFirestore(app);

// export const checkIfUserExists = async (email: string) => {
//   // Reference to the users collection

//   const usersCollection = collection(db, 'users');

//   // Create a query to find documents where the 'email' field is equal to userEmailToCheck
//   const q = query(usersCollection, where('email', '==', email));

//   // Get the documents that match the query
//   const querySnapshot = await getDocs(q);

//   // Check if there are any documents in the query result
//   if (!querySnapshot.empty) {
//     console.log(`User with email ${email} exists.`);
//     // Access the user data, for example:
//     const userData = querySnapshot.docs[0].data();
//     console.log('User Data:', userData);
//     return true;
//   } else {
//     console.log(`User with email ${email} does not exist.`);
//     return false;
//   }
// };

interface UserData {
  email: string;
  lastUsername: string;
  wins: number;
  losses: number;
  ties: number;
}

export async function doesUserExist(email: string): Promise<boolean> {
  const existingUserQuery = query(collection(db, 'users'), where('email', '==', email));
  const existingUserSnapshot = await getDocs(existingUserQuery);
  return !existingUserSnapshot.empty;
}

export async function updateUsername(email: string, newUsername: string): Promise<void> {
  const existingUserQuery = query(collection(db, 'users'), where('email', '==', email));
  const existingUserSnapshot = await getDocs(existingUserQuery);

  if (!existingUserSnapshot.empty) {
    const existingUserId = existingUserSnapshot.docs[0].id;
    await updateDoc(doc(db, 'users', existingUserId), { lastUsername: newUsername });
    console.log(`Updated username for user with email ${email} to ${newUsername}.`);
  } else {
    console.log(`User with email ${email} does not exist.`);
  }
}

export async function updateWins(email: string): Promise<void> {
  const existingUserQuery = query(collection(db, 'users'), where('email', '==', email));
  const existingUserSnapshot = await getDocs(existingUserQuery);

  if (!existingUserSnapshot.empty) {
    const existingUserId = existingUserSnapshot.docs[0].id;
    await updateDoc(doc(db, 'users', existingUserId), { wins: increment(1) });
    console.log(`Updated wins for user with email ${email}.`);
  } else {
    console.log(`User with email ${email} does not exist.`);
  }
}

export async function updateTies(email: string): Promise<void> {
  const existingUserQuery = query(collection(db, 'users'), where('email', '==', email));
  const existingUserSnapshot = await getDocs(existingUserQuery);

  if (!existingUserSnapshot.empty) {
    const existingUserId = existingUserSnapshot.docs[0].id;
    await updateDoc(doc(db, 'users', existingUserId), { ties: increment(1) });
    console.log(`Updated ties for user with email ${email}.`);
  } else {
    console.log(`User with email ${email} does not exist.`);
  }
}

export async function updateLosses(email: string): Promise<void> {
  const existingUserQuery = query(collection(db, 'users'), where('email', '==', email));
  const existingUserSnapshot = await getDocs(existingUserQuery);

  if (!existingUserSnapshot.empty) {
    const existingUserId = existingUserSnapshot.docs[0].id;
    await updateDoc(doc(db, 'users', existingUserId), { losses: increment(1) });
    console.log(`Updated losses for user with email ${email}.`);
  } else {
    console.log(`User with email ${email} does not exist.`);
  }
}

export async function createUser(email: string, username: string): Promise<void> {
  if (await doesUserExist(email)) {
    // If the user exists, update the user's information
    await updateUsername(email, username);
  } else {
    // If the user doesn't exist, create a new user document
    const newUser: UserData = {
      email,
      lastUsername: username,
      wins: 0,
      losses: 0,
      ties: 0,
    };

    try {
      const docRef = await addDoc(collection(db, 'users'), newUser);
      console.log(`User added with ID: ${docRef.id}`);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  }
}

export async function getTopUsersByWins(topN: number): Promise<UserData[]> {
  const usersCollection = collection(db, 'users');

  // Create a query to get the top N users with the most wins
  const orderedAndLimitedQuery = query(usersCollection, orderBy('wins', 'desc'), limit(topN));

  // Execute the query
  const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(orderedAndLimitedQuery);

  // Extract user data from the query snapshot and cast to the correct type
  const topUsers: UserData[] = querySnapshot.docs.map(doc => doc.data() as UserData);

  return topUsers;
}
