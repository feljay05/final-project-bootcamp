import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AddMovieModal({ show, onClose, onAdded }) {
  const [form, setForm] = useState({
    title: "",
    coverUrl: "",
    description: "",
    director: "",
    releaseYear: "",
    duration: "",
    genre: "",
    rating: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      title,
      coverUrl,
      description,
      director,
      releaseYear,
      duration,
      genre,
      rating,
    } = form;

    if (
      !title ||
      !coverUrl ||
      !description ||
      !director ||
      !releaseYear ||
      !duration ||
      !genre ||
      !rating
    ) {
      setError("Semua kolom wajib diisi.");
      return;
    }

    try {
      await addDoc(collection(db, "movies"), {
        title: title.trim(),
        coverUrl: coverUrl.trim(),
        description: description.trim(),
        director: director.trim(),
        releaseYear: parseInt(releaseYear),
        duration: parseInt(duration),
        genre: genre.split(",").map((g) => g.trim()),
        rating: parseFloat(rating),
        createdAt: new Date(),
      });

      setForm({
        title: "",
        coverUrl: "",
        description: "",
        director: "",
        releaseYear: "",
        duration: "",
        genre: "",
        rating: "",
      });

      setError("");
      onClose();
      onAdded(); // trigger fetch movie baru
    } catch (err) {
      console.error("Error adding movie:", err);
      setError("Gagal menambahkan movie.");
    }
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          padding: "2rem",
          width: "90%",
          maxWidth: "500px",
        }}
      >
        <h2>Tambah Movie</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Judul"
            value={form.title}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            type="text"
            name="coverUrl"
            placeholder="Cover URL"
            value={form.coverUrl}
            onChange={handleChange}
            style={inputStyle}
          />
          <textarea
            name="description"
            placeholder="Deskripsi"
            value={form.description}
            onChange={handleChange}
            rows={3}
            style={inputStyle}
          />
          <input
            type="text"
            name="director"
            placeholder="Sutradara"
            value={form.director}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            type="number"
            name="releaseYear"
            placeholder="Tahun Rilis"
            value={form.releaseYear}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            type="number"
            name="duration"
            placeholder="Durasi (menit)"
            value={form.duration}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            type="text"
            name="genre"
            placeholder="Genre (pisahkan dengan koma)"
            value={form.genre}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            type="number"
            step="0.1"
            name="rating"
            placeholder="Rating (contoh: 8.5)"
            value={form.rating}
            onChange={handleChange}
            style={{ ...inputStyle, marginBottom: "1rem" }}
          />

          {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={cancelBtnStyle}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={submitBtnStyle}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  marginBottom: "0.75rem",
  padding: "0.5rem",
};

const cancelBtnStyle = {
  backgroundColor: "#ccc",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "4px",
  cursor: "pointer",
};

const submitBtnStyle = {
  backgroundColor: "#0070f3",
  color: "white",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "4px",
  cursor: "pointer",
};
