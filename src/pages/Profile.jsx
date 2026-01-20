import { useParams } from "react-router-dom";
import "../App.css";
import { professionals } from "../data/professionals";

function Profile() {
  const { username } = useParams();

  const professional = professionals.find(
    (p) => p.username.replace("@", "") === username
  );

  if (!professional) {
    return (
      <div style={{ padding: "2rem", color: "white" }}>
        <h2>Perfil no encontrado</h2>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div
        className="profile-hero"
        style={{ backgroundImage: `url('${professional.image}')` }}
      >
        <div className="profile-overlay"></div>
      </div>

      <div className="profile-content">
        <div
          className="profile-avatar"
          style={{ backgroundImage: `url('${professional.avatar}')` }}
        ></div>

        <h1>{professional.username}</h1>
        <p className="profile-category">{professional.category}</p>
        <p className="profile-location">📍 {professional.location}</p>

        <p className="profile-description">{professional.description}</p>

        <button className="profile-contact">Contactar</button>
      </div>
    </div>
  );
}

export default Profile;
