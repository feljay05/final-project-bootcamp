import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminMovieDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchMovie();
  }, [id]);

  const fetchMovie = async () => {
    try {
      const ref = doc(db, "movies", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setMovie(snap.data());
      } else {
        alert("Movie tidak ditemukan.");
        router.push("/admin");
      }
    } catch (err) {
      console.error("Gagal fetch movie:", err);
      alert("Gagal mengambil data movie.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm(`Yakin ingin menghapus "${movie.title}"?`);
    if (!confirm) return;

    try {
      const ref = doc(db, "movies", id);
      await deleteDoc(ref);

      alert("Movie berhasil dihapus.");
      router.push("/admin");
    } catch (err) {
      console.error("Gagal hapus movie:", err);
      alert("Gagal menghapus movie.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!movie) return <p>Movie tidak ditemukan.</p>;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
        
  <div style={{ marginBottom: "2rem" }}>
    <button
      onClick={() => router.back()}
      style={{
        backgroundColor: "#777",
        color: "white",
        padding: "0.5rem 1rem",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      ← Kembali
    </button>
  </div>

  <div style={{ marginBottom: "1.5rem" }}>
    <img
      src={movie.coverUrl}
      alt={movie.title}
      style={{ width: "100%", borderRadius: "8px" }}
    />
  </div>

 <h1>{movie.title}</h1>
<p><strong>Director:</strong> {movie.director}</p>
<p><strong>Release Year:</strong> {movie.releaseYear}</p>
<p><strong>Genre:</strong> {movie.genre?.join(", ")}</p>
<p><strong>Duration:</strong> {movie.duration} minutes</p>
<p><strong>Rating:</strong> {movie.rating}</p>
<p><strong>Description:</strong></p>
<p>{movie.description}</p>



      <button
        onClick={handleDelete}
        style={{
          marginTop: "2rem",
          backgroundColor: "crimson",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Hapus Movie
      </button>
    </div>
  );
}
