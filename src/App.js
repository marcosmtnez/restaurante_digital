import {  useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Platos from "./components/Platos";
import Pedido from "./pages/Pedido";
import NotificacionCarrito from "./components/NotificacionCarrito";
import PantallaBienvenida from "./components/PantallaBienvenida";
import "./App.css";

function AppContent() {
  const [categoria, setCategoria] = useState("Entrantes");
  const [mostrarBienvenida, setMostrarBienvenida] = useState(true);


  return (
    <div className="app-wrapper">
      {mostrarBienvenida && (
        <PantallaBienvenida onSalir={() => setMostrarBienvenida(false)} />
      )}

      <NotificacionCarrito />

      <div className="body-container">
        <Navbar categoria={categoria} setCategoria={setCategoria} />
        <Routes>
          <Route path="/" element={<Platos categoria={categoria} />} />
          <Route path="/pedido" element={<Pedido />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;


