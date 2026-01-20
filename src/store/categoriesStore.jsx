import { createContext, useContext, useState } from "react";

const CategoriesContext = createContext();

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([
    "Fotografía",
    "Filmmaker",
    "Impresión 3D",
    "Diseño",
    "Electricista",
  ]);

  return (
    <CategoriesContext.Provider value={{ categories, setCategories }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoriesContext);
}