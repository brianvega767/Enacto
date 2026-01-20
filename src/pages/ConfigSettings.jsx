import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

function ConfigSettings() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [name, setName] = useState(profile?.full_name || "");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [toast, setToast] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const saveName = async () => {
    if (!user?.id) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name })
      .eq("id", user.id);

    if (error) {
      showToast("No se pudo actualizar el nombre");
      return;
    }

    showToast("Nombre actualizado correctamente");
  };

  const updateEmail = () => {
    showToast("Funcionalidad pendiente: cambio de email");
    setNewEmail("");
  };

  const updatePhone = () => {
    showToast("Funcionalidad pendiente: cambio de teléfono");
    setNewPhone("");
  };

  const updatePassword = () => {
    if (newPass.length < 8) {
      return showToast("La contraseña debe tener mínimo 8 caracteres");
    }
    if (newPass !== confirmPass) {
      return showToast("Las contraseñas no coinciden");
    }

    showToast("Funcionalidad pendiente: cambio de contraseña");
    setNewPass("");
    setConfirmPass("");
  };

  const deleteAccount = () => {
    if (!confirm("¿Seguro que querés eliminar tu cuenta? Esta acción es irreversible.")) {
      return;
    }

    showToast("Funcionalidad pendiente: eliminación de cuenta");
  };

  return (
    <div className="config-page">

      <button className="asistente-back" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <h1 className="asistente-title">Configuración de cuenta</h1>

      {/* DATOS PERSONALES */}
      <div className="config-card">
        <h3>Datos personales</h3>

        <label>Nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button className="config-btn" onClick={saveName}>
          Guardar cambios
        </button>
      </div>

      {/* CAMBIAR EMAIL */}
      <div className="config-card">
        <h3>Cambiar email</h3>

        <input
          type="email"
          placeholder="Nuevo email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />

        <button className="config-btn" onClick={updateEmail}>
          Actualizar email
        </button>
      </div>

      {/* CAMBIAR NÚMERO */}
      <div className="config-card">
        <h3>Cambiar número de teléfono</h3>

        <input
          type="text"
          placeholder="Nuevo número"
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
        />

        <button className="config-btn" onClick={updatePhone}>
          Actualizar número
        </button>
      </div>

      {/* CAMBIAR CONTRASEÑA */}
      <div className="config-card">
        <h3>Cambiar contraseña</h3>

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
        />
        <input
          type="password"
          placeholder="Repetir contraseña"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
        />

        <button className="config-btn" onClick={updatePassword}>
          Actualizar contraseña
        </button>
      </div>

      {/* ELIMINAR CUENTA */}
      <div className="config-card danger">
        <h3>Eliminar cuenta</h3>

        <button className="config-btn-danger" onClick={deleteAccount}>
          Eliminar definitivamente
        </button>
      </div>

      {toast && <div className="toast top">{toast}</div>}
    </div>
  );
}

export default ConfigSettings;
