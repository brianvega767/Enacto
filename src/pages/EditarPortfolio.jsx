import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function EditarPortfolio() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/asistente-profesional/paso-4", { replace: true });
  }, [navigate]);

  return null;
}

export default EditarPortfolio;
