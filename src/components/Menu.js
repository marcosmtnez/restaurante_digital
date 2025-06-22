import React, { useContext } from "react";
import Platos from "./Platos";
import { IdiomaContext } from "../context/IdiomaContext";
import traducciones from "../traducciones";

const categorias = [
  { id: "Entrantes", clave: "Entrantes" },
  { id: "Platos principales", clave: "Platos principales" },
  { id: "Wraps y Bocadillos", clave: "Wraps y Bocadillos" },
  { id: "Especialidades Internacionales", clave: "Especialidades Internacionales" },
  { id: "Postres", clave: "Postres" },
  { id: "Bebidas", clave: "Bebidas" },
];


const Menu = () => {
  const { idioma } = useContext(IdiomaContext);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold text-blue-600">{traducciones[idioma].titulo}</h1>
      <h2 className="text-2xl font-bold mt-4">{traducciones[idioma].menu}</h2>
      
      {/* Botones de navegación */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        {categorias.map((categoria) => (
          <button
            key={categoria.id}
            onClick={() => scrollToSection(categoria.id)}
            className="p-4 bg-blue-500 text-white rounded-lg text-center hover:bg-blue-700 transition"
          >
            {traducciones[idioma][categoria.clave]}
          </button>
        ))}
      </div>

      {/* Secciones de la carta */}
      {categorias.map((categoria) => (
        <div key={categoria.id} id={categoria.id}>
          <Platos categoria={categoria.clave} />
        </div>
      ))}
    </div>
  );
};

export default Menu;
