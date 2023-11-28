import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCnHjG0ewAzWxGqlAOVDO9DVUGWTs8pVEs',
  authDomain: 'cs4530-final-project.firebaseapp.com',
  projectId: 'cs4530-final-project',
  storageBucket: 'cs4530-final-project.appspot.com',
  messagingSenderId: '240965719440',
  appId: '1:240965719440:web:639020f76ec2c1b6358f15',
  measurementId: 'G-HXTPJ5FP3K',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
