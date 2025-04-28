import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const isAuthenticated = sessionStorage.getItem("isAuthenticated") === "true";

  // If authenticated, render the child routes (Outlet)
  // If not, redirect to login page
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
