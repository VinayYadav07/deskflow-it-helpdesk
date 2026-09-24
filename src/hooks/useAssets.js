import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const useAssets = () => {
  const { user } = useAuth();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    // Get assets from Firebase
    const assetsRef = collection(db, "assets");

    const assetsQuery =
      user.role === "admin"
        ? query(assetsRef)
        : query(assetsRef, where("assignedTo.uid", "==", user.uid));

    const unsubscribe = onSnapshot(
      assetsQuery,
      (snapshot) => {
        const assetList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        assetList.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        setAssets(assetList);
        setLoading(false);
      },
      (error) => {
        console.error("Assets error:", error);
        setError("Could not load assets.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  return {
    assets,
    loading,
    error,
  };
};

export default useAssets;
