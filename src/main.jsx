import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CategoriesProvider } from "./store/categoriesStore";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <CategoriesProvider>
        <App />
      </CategoriesProvider>
    </AuthProvider>
  </BrowserRouter>
);
