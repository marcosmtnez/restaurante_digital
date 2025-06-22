import React, { createContext, useState } from "react";

export const IdiomaContext = createContext();

export const IdiomaProvider = ({ children }) => {
  const [idioma, setIdioma] = useState("es"); // Español por defecto

  const cambiarIdioma = (nuevoIdioma) => {
    setIdioma(nuevoIdioma);
  };

  return (
    <IdiomaContext.Provider value={{ idioma, cambiarIdioma, setIdioma }}>
      {children}
    </IdiomaContext.Provider>
  );
};
