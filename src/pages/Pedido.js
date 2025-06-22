import React, { useContext } from "react";
import { PedidoContext } from "../context/PedidoContext";
import { IdiomaContext } from "../context/IdiomaContext";
import { useNavigate } from "react-router-dom";

const Pedido = () => {
  const { pedido, eliminarDelPedido } = useContext(PedidoContext);
  const { idioma } = useContext(IdiomaContext);
  const navigate = useNavigate();

  const calcularTotal = () => {
    return pedido.reduce((total, plato) => total + plato.precio * plato.cantidad, 0).toFixed(2);
  };

  const traducciones = {
    es: {
      titulo: "Tu Pedido",
      vacio: "No has añadido platos aún.",
      total: "Total",
      volver: "Volver a la carta",
    },
    en: {
      titulo: "Your Order",
      vacio: "You haven't added any dishes yet.",
      total: "Total",
      volver: "Back to menu",
    },
    fr: {
      titulo: "Votre Commande",
      vacio: "Vous n'avez encore ajouté aucun plat.",
      total: "Total",
      volver: "Retour au menu",
    },
    it: {
      titulo: "Il tuo Ordine",
      vacio: "Non hai ancora aggiunto piatti.",
      total: "Totale",
      volver: "Torna al menu",
    },
  };

  const t = traducciones[idioma] || traducciones.es;

  return (
    <div className="p-6 max-w-3xl mx-auto mt-20">
      <h2 className="text-3xl font-bold text-center mb-6">{t.titulo}</h2>

      {pedido.length === 0 ? (
        <p className="text-center text-gray-500">{t.vacio}</p>
      ) : (
        <>
          <ul className="bg-white p-4 shadow-lg rounded-lg">
            {pedido.map((plato) => (
              <li
                key={plato.nombre}
                className="text-lg flex justify-between items-center border-b py-2"
              >
                <span>
                  {plato.nombre} x{plato.cantidad} - {plato.precio * plato.cantidad}€
                </span>
                <button
                  className="ml-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-700 transition"
                  onClick={() => eliminarDelPedido(plato.nombre)}
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
          <h3 className="text-xl font-bold text-right mt-4">
            {t.total}: {calcularTotal()}€
          </h3>
        </>
      )}

      {/* ✅ SOLO UN BOTÓN, SIEMPRE ABAJO */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-[#00f2aa] text-white font-semibold rounded-full shadow hover:bg-[#00dba0] transition"
        >
          {t.volver}
        </button>
      </div>
    </div>
  );
};

export default Pedido;






