import React, { createContext, useState, useEffect } from "react";

export const PedidoContext = createContext();

export const PedidoProvider = ({ children }) => {
  const [pedido, setPedido] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // ✅ Cargar pedido desde localStorage al iniciar
  useEffect(() => {
    const pedidoGuardado = JSON.parse(localStorage.getItem("pedido")) || [];
    setPedido(pedidoGuardado);
  }, []);

  // ✅ Guardar pedido en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem("pedido", JSON.stringify(pedido));
  }, [pedido]);

  // ✅ Agregar un plato al pedido (suma una unidad si ya existe)
  const agregarAlPedido = (plato) => {
    setPedido((prevPedido) => {
      const nuevoPedido = [...prevPedido];
      const index = nuevoPedido.findIndex((p) => p.nombre === plato.nombre);

      if (index !== -1) {
        nuevoPedido[index] = {
          ...nuevoPedido[index],
          cantidad: nuevoPedido[index].cantidad + 1,
        };
      } else {
        nuevoPedido.push({ ...plato, cantidad: 1 });
      }

      return nuevoPedido;
    });

    // ✅ Mostrar mensaje temporal de confirmación
    setMensaje(`${plato.nombre} añadido al pedido`);
    setTimeout(() => setMensaje(""), 1500);
  };

  // ✅ Eliminar solo UNA unidad correctamente
  const eliminarDelPedido = (nombrePlato) => {
    setPedido((prevPedido) =>
      prevPedido
        .map((p) =>
          p.nombre === nombrePlato
            ? { ...p, cantidad: p.cantidad - 1 }
            : p
        )
        .filter((p) => p.cantidad > 0)
    );
  };

  // ✅ Vaciar completamente el pedido
  const vaciarPedido = () => {
    setPedido([]);
    localStorage.removeItem("pedido");
  };

  return (
    <PedidoContext.Provider
      value={{
        pedido,
        agregarAlPedido,
        eliminarDelPedido,
        vaciarPedido,
        mensaje,
      }}
    >
      {children}
    </PedidoContext.Provider>
  );
};


