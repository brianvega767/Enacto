import { useState, useEffect } from "react";
import Header from "../components/Header";
import "../App.css";
import Sidebar from "../components/Sidebar";
import Feed from "../components/Feed";
import { supabase } from "../supabaseClient";

function Home() {
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);

  // ✅ contador de profesionales activos
  const [professionalsCount, setProfessionalsCount] = useState(null);

  useEffect(() => {
    function updateOffset() {
      const header = document.querySelector(".header");
      const categories = document.querySelector(".categories-bar");

      let totalHeight = 0;

      if (header) {
        totalHeight += header.getBoundingClientRect().height;
      }

      if (categories && !categories.classList.contains("hidden")) {
        totalHeight += categories.getBoundingClientRect().height;
      }

      setOffset(totalHeight + 10);
    }

    updateOffset();
    window.addEventListener("resize", updateOffset);
    window.addEventListener("scroll", updateOffset);

    return () => {
      window.removeEventListener("resize", updateOffset);
      window.removeEventListener("scroll", updateOffset);
    };
  }, []);

  // =========================
  // CONTADOR REAL (AISLADO)
  // =========================
  useEffect(() => {
    const fetchProfessionalsCount = async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_professional", true)
        .eq("status", "active");

      if (!error) {
        setProfessionalsCount(count ?? 0);
      }
    };

    fetchProfessionalsCount();
  }, []);

  return (
    <div className="layout-container">
      <Sidebar />

      <div className="main-content">
        <Header search={search} setSearch={setSearch} />

        <div className="feed-wrapper" style={{ paddingTop: offset }}>
          {/* ✅ CONTADOR LATERAL (no toca Feed) */}
          <div className="home-professionals-counter">
            <div className="home-counter-label">
              Profesionales activos
            </div>
            <div className="home-counter-number">
              {professionalsCount === null ? "—" : professionalsCount}
            </div>
          </div>

          {/* Feed original, intacto */}
          <Feed search={search} />
        </div>
      </div>
    </div>
  );
}

export default Home;
