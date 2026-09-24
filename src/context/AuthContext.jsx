import { createContext, useContext, useEffect, useRef, useState } from "react";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../firebase";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signingUp = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (signingUp.current) {
        return;
      }

      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Show the user immediately
      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.displayName || fbUser.email,
        role: "employee",
      });

      setLoading(false);

      // Load extra profile information in the background
      try {
        const userDoc = await getDoc(doc(db, "users", fbUser.uid));

        if (userDoc.exists()) {
          const data = userDoc.data();

          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            name: data.name || fbUser.displayName || fbUser.email,
            role: data.role || "employee",
          });
        }
      } catch (err) {
        console.error("Could not load profile:", err);
      }
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (name, email, password) => {
    signingUp.current = true;

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(cred.user, {
        displayName: name,
      });

      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email,
        role: "employee",
        createdAt: serverTimestamp(),
      });

      setUser({
        uid: cred.user.uid,
        email,
        name,
        role: "employee",
      });
    } catch (err) {
      console.error("Signup error:", err);
      throw err;
    } finally {
      signingUp.current = false;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  if (loading) {
    return <div className="full-center muted">Loading DeskFlow...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthProvider, useAuth };
