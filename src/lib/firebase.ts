/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
// @ts-ignore - firestoreDatabaseId might not exist in type but is used in instructions
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export async function login() {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Login failed:", error);
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
  }
}

async function testConnection() {
  try {
    // Testing connection as recommended in instructions
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    // We expect a permission denied or similar if not authenticated, 
    // but a "client is offline" is what we're checking for.
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

testConnection();
