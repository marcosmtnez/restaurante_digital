import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Platos from "../components/Platos";

const Home = () => {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Entrantes");

  return (
    <div>
      <Navbar categoriaSeleccionada={categoriaSeleccionada} setCategoriaSeleccionada={setCategoriaSeleccionada} />
      <h1 className="text-3xl font-bold text-center mt-4">Bienvenido a la Carta Digital 🍽️</h1>
      <h2 className="text-2xl font-semibold text-center mt-2">Carta</h2>
      <Platos categoria={categoriaSeleccionada} />
    </div>
  );
};

export default Home;

