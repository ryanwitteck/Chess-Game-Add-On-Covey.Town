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

export interface UserData {
  username: string;
  wins: number;
  losses: number;
  ties: number;
}

export async function doesUserExist(username: string): Promise<boolean> {
  const existingUserQuery = query(collection(db, 'users'), where('username', '==', username));
  const existingUserSnapshot = await getDocs(existingUserQuery);
  return !existingUserSnapshot.empty;
}

export async function updateWins(username: string | undefined): Promise<void> {
  if (username === undefined) {
    console.log(`Username undefined.`);
    return;
  }
  const existingUserQuery = query(collection(db, 'users'), where('username', '==', username));
  const existingUserSnapshot = await getDocs(existingUserQuery);

  if (!existingUserSnapshot.empty) {
    const existingUserId = existingUserSnapshot.docs[0].id;
    await updateDoc(doc(db, 'users', existingUserId), { wins: increment(1) });
    console.log(`Updated wins for user with username ${username}.`);
  } else {
    console.log(`User with username ${username} does not exist.`);
  }
}

export async function updateTies(username: string | undefined): Promise<void> {
  if (username === undefined) {
    console.log(`Username undefined.`);
    return;
  }

  const existingUserQuery = query(collection(db, 'users'), where('username', '==', username));
  const existingUserSnapshot = await getDocs(existingUserQuery);

  if (!existingUserSnapshot.empty) {
    const existingUserId = existingUserSnapshot.docs[0].id;
    await updateDoc(doc(db, 'users', existingUserId), { ties: increment(1) });
    console.log(`Updated ties for user with username ${username}.`);
  } else {
    console.log(`User with username ${username} does not exist.`);
  }
}

export async function updateLosses(username: string | undefined): Promise<void> {
  if (username === undefined) {
    console.log(`Username undefined.`);
    return;
  }

  const existingUserQuery = query(collection(db, 'users'), where('username', '==', username));
  const existingUserSnapshot = await getDocs(existingUserQuery);

  if (!existingUserSnapshot.empty) {
    const existingUserId = existingUserSnapshot.docs[0].id;
    await updateDoc(doc(db, 'users', existingUserId), { losses: increment(1) });
    console.log(`Updated losses for user with username ${username}.`);
  } else {
    console.log(`User with username ${username} does not exist.`);
  }
}

export async function createUser(username: string): Promise<void> {
  if (!(await doesUserExist(username))) {
    // If the user doesn't exist, create a new user document
    const newUser: UserData = {
      username,
      wins: 0,
      losses: 0,
      ties: 0,
    };

    try {
      await addDoc(collection(db, 'users'), newUser);
      console.log(`User added with username: ${username}`);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  } else {
    console.log(`User with username ${username} already exists.`);
  }
}

export async function getTopUsersByWins(topN: number): Promise<UserData[]> {
  const usersCollection = collection(db, 'users');

  // Create a query to get the top N users with the most wins
  const orderedAndLimitedQuery = query(usersCollection, orderBy('wins', 'desc'), limit(topN));

  // Execute the query
  const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(orderedAndLimitedQuery);

  // Extract user data from the query snapshot and cast to the correct type
  const topUsers: UserData[] = querySnapshot.docs.map(d => d.data() as UserData);

  return topUsers;
}
