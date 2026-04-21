import { useState, useEffect } from 'react';
import { auth, signInWithGoogle, db } from '../lib/firebase';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (!userDoc.exists()) {
          // Initialize user profile
          const profile = {
            email: u.email,
            name: u.displayName,
            photoURL: u.photoURL,
            role: 'user',
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', u.uid), profile);
          setIsAdmin(false);
        } else {
          setIsAdmin(userDoc.data().role === 'admin');
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
  }, []);

  return { 
    user, 
    loading, 
    isAdmin, 
    login: signInWithGoogle, 
    logout: () => signOut(auth),
    getToken: async () => {
      if (user) return await user.getIdToken();
      return null;
    }
  };
}
