import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function CollectionDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [collectionData, setCollectionData] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmRemove, setConfirmRemove] = useState(null);

  const fetchCollection = async (collectionId) => {
    try {
      const docRef = doc(db, "collections", collectionId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setCollectionData({ id: docSnap.id, ...data });

        if (data.movies && data.movies.length > 0) {
          const q = query(
            collection(db, "movies"),
            where("__name__", "in", data.movies)
          );
          const querySnapshot = await getDocs(q);
          const movieList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMovies(movieList);
        } else {
          setMovies([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch collection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMovie = async (movieId) => {
    try {
      const collectionRef = doc(db, "collections", id);
      await updateDoc(collectionRef, {
        movies: arrayRemove(movieId),
      });

      setMovies((prev) => prev.filter((movie) => movie.id !== movieId));
      setConfirmRemove(null);
    } catch (err) {
      console.error("Failed to remove movie:", err);
      alert("Gagal menghapus movie.");
    }
  };

  useEffect(() => {
    if (id) fetchCollection(id);
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!collectionData) return <p>Collection not found.</p>;

  return (
    <>
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
        <button
          onClick={() => router.back()}
          style={{
            marginBottom: "1rem",
            backgroundColor: "#777",
            color: "white",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <h1>{collectionData.name}</h1>
        <p>Jumlah movie: {movies.length}</p>

        {movies.length === 0 && <p>Belum ada movie dalam koleksi ini.</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {movies.map((movie) => (
            <div
              key={movie.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                position: "relative",
              }}
            >
              <Link href={`/movie/${movie.id}`} style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <img
                    src={movie.coverUrl}
                    alt={movie.title}
                    style={{ width: "100px", borderRadius: "6px" }}
                  />
                  <div>
                    <h3 style={{ margin: 0 }}>{movie.title}</h3>
                    <p style={{ margin: 0 }}>{movie.genre?.join(", ")}</p>
                  </div>
                </div>
              </Link>

              <button
                onClick={() => setConfirmRemove(movie)}
                style={{
                  backgroundColor: "crimson",
                  color: "white",
                  border: "none",
                  padding: "0.3rem 0.6rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {confirmRemove && (
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
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>Hapus Movie dari Koleksi?</h3>
            <p style={{ marginBottom: "1.5rem" }}>
              Apakah kamu yakin ingin menghapus{" "}
              <strong>{confirmRemove.title}</strong> dari koleksi?
            </p>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => setConfirmRemove(null)}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  borderRadius: "4px",
                  backgroundColor: "#ccc",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Batal
              </button>
              <button
                onClick={() => handleRemoveMovie(confirmRemove.id)}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  borderRadius: "4px",
                  backgroundColor: "crimson",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
