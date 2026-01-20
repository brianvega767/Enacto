import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

function AdminEditCategory() {
  const navigate = useNavigate();
  const params = useParams();
  console.log("PARAMS:", params);

  // ✅ Robusto: soporta distintos nombres de param en tus rutas
  const routeId =
    (typeof params.id === "string" && params.id) ||
    (typeof params.categoryId === "string" && params.categoryId) ||
    (typeof params.category_id === "string" && params.category_id) ||
    "";

  const isNew = routeId === "new";
  const hasValidId = typeof routeId === "string" && routeId !== "" && !isNew;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // =========================
  // CATEGORY
  // =========================
  const [category, setCategory] = useState({
    name: "",
    emoji: "",
    has_intermediate: false,
    is_active: true,
    order_index: 0,
    intermediate_options: [],
  });

  // =========================
  // INTERMEDIATE UI
  // =========================
  const [intermediateInput, setIntermediateInput] = useState("");
  const [intermediateEmojiInput, setIntermediateEmojiInput] = useState("");
  const [activeNamespace, setActiveNamespace] = useState("");

  // =========================
  // GROUPS (NUEVO MODELO)
  // =========================
  const [groups, setGroups] = useState([]);
  const [defaultGroupId, setDefaultGroupId] = useState("");

  // =========================
  // SUBCATEGORIES
  // =========================
  const [subcategories, setSubcategories] = useState([]);
  const [newSubLabel, setNewSubLabel] = useState("");

  // =========================
  // HELPERS
  // =========================
  const parseCommaValues = (raw) =>
    String(raw || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

  const slugifyKey = (text) =>
    String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const slugifySlug = (text) => {
    const base = slugifyKey(text);
    return base || "categoria";
  };

  const intermediateMap = useMemo(() => {
    const map = new Map();
    (groups || []).forEach((g) => map.set(g.id, g));
    return map;
  }, [groups]);

  const ensureDefaultGroup = async (categoryId, catName, catEmoji) => {
    const { data: existing, error: exErr } = await supabase
      .from("category_groups")
      .select("id, key, label, emoji, order_index, is_active")
      .eq("category_id", categoryId)
      .eq("key", "default")
      .maybeSingle();

    if (!exErr && existing?.id) {
      setDefaultGroupId(existing.id);
      return existing;
    }

    const { data: created, error: insErr } = await supabase
      .from("category_groups")
      .insert({
        category_id: categoryId,
        key: "default",
        label: (catName || "").trim() || "General",
        emoji: (catEmoji || "").trim() || "🏷️",
        order_index: 0,
        is_active: true,
      })
      .select()
      .single();

    // Si ya existe por unique (category_id, key), no es crítico
    if (insErr) {
      console.error(insErr);
      return null;
    }

    setDefaultGroupId(created?.id || "");
    return created;
  };

  // =========================
  // LOAD
  // =========================
  useEffect(() => {
    const load = async () => {
      // ✅ NEW: no cargar nada
      if (isNew) {
        setLoading(false);
        return;
      }

      // ✅ EDIT: debe haber id válido
      if (!hasValidId) {
        setError("Ruta inválida: falta el id de la categoría en la URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data: cat, error: catErr } = await supabase
        .from("categories")
        .select("*")
        .eq("id", routeId)
        .single();

      if (catErr || !cat) {
        setError("No se pudo cargar la categoría.");
        setLoading(false);
        return;
      }

      setCategory({
        name: cat.name || "",
        emoji: cat.emoji || "",
        has_intermediate: !!cat.has_intermediate,
        is_active: !!cat.is_active,
        order_index: cat.order_index ?? 0,
        // 🔥 ya no se usa, pero lo mantenemos para no romper nada
        intermediate_options: [],
      });

      // 1) Cargar groups reales
      const { data: groupsData, error: groupsErr } = await supabase
        .from("category_groups")
        .select("id, category_id, key, label, emoji, is_active, order_index")
        .eq("category_id", routeId)
        .order("order_index", { ascending: true });

      if (groupsErr) {
        console.error(groupsErr);
      }

      const safeGroups = (groupsData || []).map((g) => ({
        id: g.id,
        category_id: g.category_id,
        key: g.key,
        label: g.label,
        emoji: (g.emoji || "").trim() || "🏷️",
        is_active: g.is_active !== false,
        order_index: g.order_index ?? 0,
      }));

      setGroups(safeGroups);

      const defaultG = safeGroups.find((g) => g.key === "default");
      if (defaultG?.id) setDefaultGroupId(defaultG.id);

      // Si es simple y no hay default, intentamos crearlo (recomendado)
      if (!cat.has_intermediate && !defaultG?.id) {
        const created = await ensureDefaultGroup(routeId, cat.name, cat.emoji);
        if (created?.id) {
          setGroups((prev) => [
            ...prev,
            {
              id: created.id,
              category_id: created.category_id,
              key: created.key,
              label: created.label,
              emoji: (created.emoji || "").trim() || "🏷️",
              is_active: created.is_active !== false,
              order_index: created.order_index ?? 0,
            },
          ]);
        }
      }

      // 2) Cargar subcategories por group_id (nuevo modelo)
      const { data: subs } = await supabase
        .from("subcategories")
        .select("id, label, value, group_id, is_active, order_index")
        .order("order_index", { ascending: true });

      // Nota: filtramos acá para no depender de category_id en subcategories
      const groupIds = (safeGroups || []).map((g) => g.id);
      const filteredSubs = (subs || []).filter((s) => groupIds.includes(s.group_id));

      setSubcategories(filteredSubs || []);

      // Active namespace ahora guarda group_id
      if (cat.has_intermediate) {
        const firstGroup = safeGroups.find((g) => g.key !== "default") || safeGroups[0];
        setActiveNamespace(firstGroup?.id || "");
      } else {
        setActiveNamespace(defaultG?.id || "");
      }

      setLoading(false);
    };

    load();
  }, [routeId, isNew, hasValidId]);

  // =========================
  // VALIDATIONS
  // =========================
  const validateCreate = () => {
    if (!category.name.trim()) {
      alert("El nombre es obligatorio.");
      return false;
    }
    return true;
  };

  const validateEdit = () => {
    if (!category.name.trim()) {
      alert("El nombre es obligatorio.");
      return false;
    }

    if (category.has_intermediate) {
      const activeGroups = (groups || []).filter((g) => g.is_active !== false && g.key !== "default");

      if (!activeGroups.length) {
        alert(
          "Una categoría agrupadora debe tener al menos 1 categoría interna (paso intermedio)."
        );
        return false;
      }

      const activeSubs = (subcategories || []).filter((s) => s.is_active !== false);
      const missing = activeGroups.filter((g) => {
        return !activeSubs.some((s) => s.group_id === g.id);
      });

      if (missing.length > 0) {
        alert(
          `Cada categoría interna debe tener subcategorías.\nFaltan en: ${missing
            .map((m) => m.label)
            .join(", ")}`
        );
        return false;
      }
    } else {
      // Si es simple, sugerimos (no bloqueamos) que exista default group
      // (pero ya lo intentamos crear en load / create)
    }

    return true;
  };

  // =========================
  // CREATE CATEGORY (SOLO CREAR)
  // =========================
  const createCategory = async () => {
    const { data: { session }, error: sessionError } =
  await supabase.auth.getSession()

console.log('SESSION EN ADMIN:', session)

if (!session || !session.user) {
  alert('Sesión no cargada todavía. Reintentá en unos segundos.')
  return
}

    if (!isNew) return;
    if (!validateCreate()) return;

    setSaving(true);
    setError(null);

    try {
      const name = category.name.trim();
      const emoji = (category.emoji || "").trim() || "🏷️";
      const slug = slugifySlug(name);

      const { data, error } = await supabase
        .from("categories")
        .insert({
          name,
          slug,
          emoji,
          has_intermediate: category.has_intermediate,
          is_active: category.is_active,
          order_index: category.order_index ?? 0,
          intermediate_options: [],
        })
        .select()
        .single();

      if (error) throw error;

      // ✅ Recomendado: si es simple, crear default group (si no hay trigger)
      if (!category.has_intermediate) {
  const { error } = await supabase
    .from("category_groups")
    .insert(
      {
        category_id: data.id,
        key: "default",
        label: name,
        emoji,
        order_index: 0,
        is_active: true,
      },
      { ignoreDuplicates: true }
    );

  // opcional: solo loguear si hay otro error real
  if (error) {
    console.error("Error creando category_group:", error);
  }
}


      navigate(`/admin/categories/${data.id}`, { replace: true });
    } catch (e) {
      console.error(e);
      if (e?.code === "23505") {
        setError("Ya existe una categoría con ese nombre/slug. Probá otro nombre.");
      } else {
        setError("No se pudo crear la categoría.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // SAVE CATEGORY (SOLO EDITAR)
  // =========================
  const saveCategory = async () => {
    if (!hasValidId) {
      alert("No se puede guardar: falta el id de la categoría.");
      return;
    }

    if (!validateEdit()) return;

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("categories")
        .update({
          name: category.name.trim(),
          emoji: (category.emoji || "").trim() || "🏷️",
          has_intermediate: category.has_intermediate,
          is_active: category.is_active,
          order_index: category.order_index ?? 0,
          intermediate_options: [],
        })
        .eq("id", routeId);

      if (error) throw error;

      // Si la pasás a simple, asegurar default group para uniformidad
      if (!category.has_intermediate) {
        await ensureDefaultGroup(routeId, category.name, category.emoji);
      }

      navigate("/admin/categories");
    } catch (e) {
      console.error(e);
      setError("No se pudo guardar la categoría.");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // INTERMEDIATE HANDLERS (NUEVO: category_groups)
  // =========================
  const addIntermediateOptions = async () => {
    if (isNew || !hasValidId) {
      alert("Primero creá la categoría para poder agregar categorías internas.");
      return;
    }

    // 🔥 Ahora se agrega 1 por vez para permitir emoji por item
    const maybeMany = parseCommaValues(intermediateInput);
    if (!maybeMany.length) return;

    if (maybeMany.length > 1) {
      alert(
        "Para asignar un emoji a cada categoría interna, agregalas de a una.\n" +
          "Ejemplo: escribí 'Fotografía' y elegí su emoji, luego agregá 'Video'."
      );
      return;
    }

    const label = maybeMany[0];
    const key = slugifyKey(label);
    if (!key) return;

    const emoji = intermediateEmojiInput?.trim() || "🏷️";

    // Evitar duplicados por key (en UI)
    if ((groups || []).some((g) => g.key === key)) {
      alert("Ya existe una categoría interna con ese nombre.");
      return;
    }

    const order_index =
      (groups || [])
        .filter((g) => g.key !== "default")
        .reduce((max, g) => Math.max(max, g.order_index ?? 0), -1) + 1;

    const { data, error } = await supabase
      .from("category_groups")
      .insert({
        category_id: routeId,
        key,
        label,
        emoji,
        order_index,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("No se pudieron guardar las categorías internas.");
      return;
    }

    const created = {
      id: data.id,
      category_id: data.category_id,
      key: data.key,
      label: data.label,
      emoji: (data.emoji || "").trim() || "🏷️",
      is_active: data.is_active !== false,
      order_index: data.order_index ?? 0,
    };

    setGroups((prev) => [...prev, created]);

    if (!activeNamespace) {
      setActiveNamespace(created.id);
    }

    setIntermediateInput("");
    setIntermediateEmojiInput("");
  };

  const removeIntermediateOption = async (key) => {
    if (isNew || !hasValidId) return;

    // key ahora es group_id
    const toRemove = (groups || []).find((g) => g.id === key);
    if (!toRemove) return;

    const { error } = await supabase.from("category_groups").delete().eq("id", toRemove.id);

    if (error) {
      console.error(error);
      alert("No se pudieron guardar las categorías internas.");
      return;
    }

    const next = (groups || []).filter((g) => g.id !== toRemove.id);
    setGroups(next);

    // FK on delete cascade puede borrar subcategorías: reflejamos en UI
    setSubcategories((prev) => (prev || []).filter((s) => s.group_id !== toRemove.id));

    if (activeNamespace === toRemove.id) {
      const first = next.find((g) => g.key !== "default") || next[0];
      setActiveNamespace(first?.id || "");
    }
  };

  const updateIntermediateEmoji = async (key, emojiRaw) => {
    if (isNew || !hasValidId) return;

    const emoji = (emojiRaw || "").trim() || "🏷️";

    const { error } = await supabase
      .from("category_groups")
      .update({ emoji })
      .eq("id", key);

    if (error) {
      console.error(error);
      alert("No se pudieron guardar las categorías internas.");
      return;
    }

    setGroups((prev) =>
      (prev || []).map((g) => (g.id === key ? { ...g, emoji } : g))
    );
  };

  // =========================
  // SUBCATEGORIES HANDLERS
  // =========================
  const addSubcategories = async () => {
    if (isNew || !hasValidId) {
      alert("Primero creá la categoría para poder agregar subcategorías.");
      return;
    }

    const labels = parseCommaValues(newSubLabel);
    if (!labels.length) return;

    const groupId = category.has_intermediate ? activeNamespace : defaultGroupId;

    if (category.has_intermediate && !groupId) {
      alert("Seleccioná una categoría interna (paso intermedio) para cargar subcategorías.");
      return;
    }

    if (!category.has_intermediate && !groupId) {
      // Intentar crear default group si no existe
      const created = await ensureDefaultGroup(routeId, category.name, category.emoji);
      if (!created?.id) {
        alert("No se pudo preparar el grupo 'default' para esta categoría simple.");
        return;
      }
    }

    const activeGroup = (groups || []).find((g) => g.id === groupId);
    const groupKey = activeGroup?.key || "default";

    const baseOrder = subcategories.length;

    
    const inserts = labels.map((label, idx) => ({
    category_id: routeId,        // ✅ FIX CLAVE
    group_id: groupId,
    label,
    value: category.has_intermediate
      ? `${groupKey}-${slugifyKey(label)}`
      : slugifyKey(label),
    is_active: true,
    order_index: baseOrder + idx,
  }));

    const { data, error } = await supabase.from("subcategories").insert(inserts).select();

    if (error) {
      console.error(error);
      alert("No se pudieron crear las subcategorías.");
      return;
    }

    setSubcategories((prev) => [...prev, ...(data || [])]);
    setNewSubLabel("");
  };

  const toggleSubActive = async (sub) => {
    if (isNew || !hasValidId) return;

    const { error } = await supabase
      .from("subcategories")
      .update({ is_active: !sub.is_active })
      .eq("id", sub.id);

    if (error) {
      console.error(error);
      alert("No se pudo actualizar.");
      return;
    }

    setSubcategories((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, is_active: !sub.is_active } : s))
    );
  };

  // =========================
  // FILTERED SUBS FOR UI
  // =========================
  const visibleSubs = useMemo(() => {
    if (!category.has_intermediate) {
      if (!defaultGroupId) return subcategories;
      return subcategories.filter((s) => s.group_id === defaultGroupId);
    }
    if (!activeNamespace) return [];
    return subcategories.filter((s) => s.group_id === activeNamespace);
  }, [subcategories, category.has_intermediate, activeNamespace, defaultGroupId]);

  if (loading) return <p>Cargando…</p>;

  return (
    <div className="admin-form">
      <h1>{isNew ? "Crear categoría" : "Editar categoría"}</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* =========================
          DATOS BÁSICOS
         ========================= */}
      <section className="admin-card">
        <h3>Datos básicos</h3>

        <label>Nombre</label>
        <input
          type="text"
          value={category.name}
          onChange={(e) => setCategory({ ...category, name: e.target.value })}
        />

        <label>Emoji</label>
        <input
          type="text"
          placeholder="Ej: 📸"
          value={category.emoji}
          onChange={(e) => setCategory({ ...category, emoji: e.target.value })}
        />

        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={category.has_intermediate}
            onChange={(e) => {
              const checked = e.target.checked;

              setCategory((prev) => ({
                ...prev,
                has_intermediate: checked,
                intermediate_options: [],
              }));

              // Si pasa a simple, cambiamos activeNamespace al default si existe
              if (!checked) {
                const def = (groups || []).find((g) => g.key === "default");
                setActiveNamespace(def?.id || "");
              } else {
                const first = (groups || []).find((g) => g.key !== "default") || (groups || [])[0];
                setActiveNamespace(first?.id || "");
              }
            }}
          />
          Categoría agrupadora (tiene paso intermedio)
        </label>

        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={category.is_active}
            onChange={(e) => setCategory({ ...category, is_active: e.target.checked })}
          />
          Categoría activa
        </label>

        {isNew && category.has_intermediate && (
          <p style={{ fontSize: "0.9rem", color: "#555", marginTop: "0.8rem" }}>
            Esta será una categoría agrupadora. Primero creala y luego vas a poder cargar las
            categorías internas y sus subcategorías.
          </p>
        )}
      </section>

      {!isNew && category.has_intermediate && (
        <section className="admin-card">
          <h3>Categorías del paso intermedio</h3>

          <label>Nombre (agregá una por vez)</label>
          <input
            type="text"
            placeholder="Ej: Fotografía"
            value={intermediateInput}
            onChange={(e) => setIntermediateInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addIntermediateOptions();
              }
            }}
            onBlur={() => {
              if (intermediateInput.trim()) addIntermediateOptions();
            }}
          />

          <label>Emoji para esa categoría interna</label>
          <input
            type="text"
            placeholder="Ej: 📸"
            value={intermediateEmojiInput}
            onChange={(e) => setIntermediateEmojiInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addIntermediateOptions();
              }
            }}
          />

          <button className="admin-btn" type="button" onClick={addIntermediateOptions}>
            Agregar
          </button>

          <ul>
            {(groups || [])
              .filter((g) => g.key !== "default")
              .map((opt) => (
                <li key={opt.id}>
                  {/* Emoji editable por item */}
                  <input
                    type="text"
                    value={opt.emoji || "🏷️"}
                    placeholder="😀"
                    style={{ width: "4rem", marginRight: "0.6rem" }}
                    onChange={(e) => {
                      const val = e.target.value;
                      setGroups((prev) =>
                        (prev || []).map((x) => (x.id === opt.id ? { ...x, emoji: val } : x))
                      );
                    }}
                    onBlur={(e) => updateIntermediateEmoji(opt.id, e.target.value)}
                  />

                  <strong style={{ marginRight: "0.4rem" }}>{opt.label}</strong>

                  <button
                    type="button"
                    className="admin-btn"
                    style={{ marginLeft: "0.6rem" }}
                    onClick={() => removeIntermediateOption(opt.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
          </ul>
        </section>
      )}

      {!isNew && (
        <section className="admin-card">
          <h3>Subcategorías (Paso 2)</h3>

          {category.has_intermediate && (
            <>
              <label>Seleccionar categoría interna</label>
              <select value={activeNamespace} onChange={(e) => setActiveNamespace(e.target.value)}>
                <option value="">Seleccionar categoría</option>
                {(groups || [])
                  .filter((g) => g.key !== "default")
                  .map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.emoji} {opt.label}
                    </option>
                  ))}
              </select>
            </>
          )}

          <ul>
            {visibleSubs.map((s) => (
              <li key={s.id}>
                {s.label}{" "}
                {category.has_intermediate && (
                  <em>({intermediateMap.get(s.group_id)?.label || "Categoría"})</em>
                )}{" "}
                {s.is_active ? "✅" : "❌"}
                <button
                  type="button"
                  className="admin-btn"
                  style={{ marginLeft: "0.6rem" }}
                  onClick={() => toggleSubActive(s)}
                >
                  {s.is_active ? "Desactivar" : "Activar"}
                </button>
              </li>
            ))}
          </ul>

          <label>Agregar subcategorías (separá por comas)</label>
          <input
            type="text"
            placeholder="Ej: Eventos, Bodas, Retratos"
            value={newSubLabel}
            onChange={(e) => setNewSubLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSubcategories();
              }
            }}
            onBlur={() => {
              if (newSubLabel.trim()) addSubcategories();
            }}
          />

          <button className="admin-btn" type="button" onClick={addSubcategories}>
            Agregar
          </button>
        </section>
      )}

      <div style={{ marginTop: "2rem" }}>
        {/* ✅ FASES VISIBLES: en /new solo se puede CREAR */}
        {isNew ? (
          <button className="admin-primary-btn" onClick={createCategory} disabled={saving}>
            {saving ? "Creando…" : "Crear categoría"}
          </button>
        ) : (
          <button className="admin-primary-btn" onClick={saveCategory} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
        )}

        <button className="admin-btn" onClick={() => navigate("/admin/categories")}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default AdminEditCategory;
