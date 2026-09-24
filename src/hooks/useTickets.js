import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const useTickets = () => {
  const { user } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    setLoading(true);
    setError("");

    // Get tickets from Firebase
    const ticketsRef = collection(db, "tickets");

    const ticketsQuery =
      user.role === "admin"
        ? query(ticketsRef)
        : query(ticketsRef, where("createdBy.uid", "==", user.uid));

    const unsubscribe = onSnapshot(
      ticketsQuery,
      (snapshot) => {
        const ticketList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Show newest tickets first
        ticketList.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
        );

        setTickets(ticketList);
        setLoading(false);
      },
      (error) => {
        console.error("Tickets error:", error);
        setError("Could not load tickets.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  return {
    tickets,
    loading,
    error,
  };
};

export default useTickets;
