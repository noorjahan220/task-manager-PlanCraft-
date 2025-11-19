import { createBrowserRouter, Navigate } from "react-router-dom";
import Main from "../Layout/Main";
import Login from "../Pages/Login";
import Register from "../Pages/Register";
import DashboardLayout from "../Layout/DashboardLayout";
import TeamsPage from "../Pages/Dashboard/TeamsPage";
import ProjectsPage from "../Pages/Dashboard/ProjectsPage";
import ProjectDetails from "../Pages/Dashboard/ProjectDetails";
import DashboardHome from "../Pages/Dashboard/DashboardHome";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute"; // Import the new component
import Calendar from "../Pages/Dashboard/Calendar";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />, 
    children: [
        
        {
          index: true,
          element: <PublicRoute><Login /></PublicRoute> 
        },
        
        {
          path: "login",
          element: <PublicRoute><Login /></PublicRoute>
        },
      
        {
          path: "register",
          element: <PublicRoute><Register /></PublicRoute>
        }
    ],
  },
  
  {
    path: "/dashboard",
    element: <PrivateRoute><DashboardLayout /></PrivateRoute>, 
    children: [
        {
            index: true, 
            element: <DashboardHome />
        },
        {
            path: "teams",
            element: <TeamsPage /> 
        },
        {
            path: "projects",
            element: <ProjectsPage />
        },
        {
            path: "projects/:id",
            element: <ProjectDetails />
        },
        {
    path: 'calendar', // This matches /dashboard/calendar
    element: <Calendar />
}
    ]
  }
]);