import ReactDOM from "react-dom/client";
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

const router = createBrowserRouter([{ path: "/*", element: <App /> }], {
    future: {
      v7_relativeSplatPath: true, 
      v7_fetcherPersist: true,   
      v7_normalizeFormMethod: true, 
      v7_partialHydration: true, 
      v7_skipActionErrorRevalidation: true, 
    },
  });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
      <RouterProvider router={router} future={{ v7_startTransition: true }}/>
  </React.StrictMode>
);
