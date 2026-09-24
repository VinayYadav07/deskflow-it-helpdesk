import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import NewTicket from "./pages/NewTicket";
import TicketDetail from "./pages/TicketDetail";
import Assets from "./pages/Assets";
import NotFound from "./pages/NotFound";

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Login and signup pages */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/signup"
        element={user ? <Navigate to="/" replace /> : <Signup />}
      />

      {/* Protected pages */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />

        <Route path="/tickets" element={<Tickets />} />

        <Route path="/tickets/new" element={<NewTicket />} />

        <Route path="/tickets/:id" element={<TicketDetail />} />

        <Route path="/assets" element={<Assets />} />
      </Route>

      {/* Any unknown URL */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
