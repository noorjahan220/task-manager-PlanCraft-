import { Navigate } from "react-router-dom";
// Assuming you have an AuthContext or similar hook
import useAuth from "../hooks/useAuth"; 

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth(); // Replace with your actual auth logic

  if (loading) {
    return <div>Loading...</div>;
  }

  // If user IS logged in, force them to the dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is NOT logged in, let them see Login/Register
  return children;
};

export default PublicRoute;