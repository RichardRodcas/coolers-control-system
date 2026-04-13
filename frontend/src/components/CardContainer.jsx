import React from "react";
import "../styles/App.css"; // importa tus estilos globales

export function CardContainer({ children }) {
  return <div className="cardContainer">{children}</div>;
}