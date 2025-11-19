import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import AuthProvider from "./Provider/AuthProvider"; 
import { RouterProvider } from "react-router-dom";
import { router } from "./Routes/router";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
