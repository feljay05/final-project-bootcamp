import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function EditMovieModal({ movie, onClose, onUpdated }) {
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

  useEffect(() => {
    if (movie) {
      setForm({
        title: movie.title || "",
        coverUrl: movie.coverUrl || "",
        description: movie.description || "",
        director: movie.director || "",
        releaseYear: movie.releaseYear || "",
        duration: movie.duration || "",
        genre: movie.genre?.join(", ") || "",
        rating: movie.rating || "",
      });
    }
  }, [movie]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!movie?.id) return;

    try {
      await updateDoc(doc(db, "movies", movie.id), {
        title: form.title.trim(),
        coverUrl: form.coverUrl.trim(),
        description: form.description.trim(),
        director: form.director.trim(),
        releaseYear: parseInt(form.releaseYear),
        duration: parseInt(form.duration),
        genre: form.genre.split(",").map((g) => g.trim()),
        rating: parseFloat(form.rating),
      });

      onUpdated();
      onClose();
    } catch (err) {
      console.error("Error updating movie:", err);
      setError("Gagal mengupdate movie.");
    }
  };

  if (!movie) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>Edit Movie</h2>
        <form onSubmit={handleSubmit}>
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title" style={inputStyle} />
          <input name="coverUrl" value={form.coverUrl} onChange={handleChange} placeholder="Cover URL" style={inputStyle} />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={3} style={inputStyle} />
          <input name="director" value={form.director} onChange={handleChange} placeholder="Director" style={inputStyle} />
          <input name="releaseYear" type="number" value={form.releaseYear} onChange={handleChange} placeholder="Release Year" style={inputStyle} />
          <input name="duration" type="number" value={form.duration} onChange={handleChange} placeholder="Duration (minutes)" style={inputStyle} />
          <input name="genre" value={form.genre} onChange={handleChange} placeholder="Genre (comma separated)" style={inputStyle} />
          <input name="rating" type="number" step="0.1" value={form.rating} onChange={handleChange} placeholder="Rating" style={inputStyle} />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
            <button type="submit" style={saveBtn}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000,
};

const modalStyle = {
  background: "#fff", borderRadius: "8px", padding: "2rem", width: "90%", maxWidth: "500px"
};

const inputStyle = {
  width: "100%", marginBottom: "0.75rem", padding: "0.5rem"
};

const cancelBtn = {
  backgroundColor: "#ccc", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer"
};

const saveBtn = {
  backgroundColor: "#0070f3", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer"
};
