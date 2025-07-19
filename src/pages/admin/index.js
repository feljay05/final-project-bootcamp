import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  limit,
  orderBy,
  startAfter,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import ConfirmModal from "@/components/ConfirmModal";
import AddMovieModal from "@/components/AddMovieModal";
import EditMovieModal from "@/components/EditMovieModal";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();

  const [userRole, setUserRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  const [movies, setMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editMovie, setEditMovie] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const MOVIES_PER_PAGE = 10;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          router.replace("/login");
          return;
        }

        const role = userDoc.data().role;
        if (role !== "admin") {
          router.replace("/notauthorized");
          return;
        }

        setUserRole(role);
      } catch (error) {
        console.error("Gagal memeriksa role user:", error);
        router.replace("/login");
      } finally {
        setLoadingRole(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchMovies = async (start = null) => {
    setLoadingMovies(true);
    try {
      let q = query(
        collection(db, "movies"),
        orderBy("title"),
        limit(MOVIES_PER_PAGE)
      );

      if (start) {
        q = query(
          collection(db, "movies"),
          orderBy("title"),
          startAfter(start),
          limit(MOVIES_PER_PAGE)
        );
      }

      const snap = await getDocs(q);
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (start) {
        setMovies((prev) => [...prev, ...list]);
      } else {
        setMovies(list);
      }

      setLastDoc(snap.docs[snap.docs.length - 1]);
      setHasMore(snap.docs.length === MOVIES_PER_PAGE);
    } catch (err) {
      console.error("Failed to fetch movies:", err);
    } finally {
      setLoadingMovies(false);
    }
  };

  useEffect(() => {
    if (!loadingRole && userRole === "admin") {
      fetchMovies();
    }
  }, [loadingRole, userRole]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const movieId = confirmDelete.id;

    try {
      const collectionsSnap = await getDocs(collection(db, "collections"));
      const updates = collectionsSnap.docs.map(async (colDoc) => {
        const data = colDoc.data();
        if (data.movies?.includes(movieId)) {
          const ref = doc(db, "collections", colDoc.id);
          await updateDoc(ref, {
            movies: data.movies.filter((id) => id !== movieId),
          });
        }
      });
      await Promise.all(updates);

      await deleteDoc(doc(db, "movies", movieId));
      setMovies((prev) => prev.filter((m) => m.id !== movieId));
      setConfirmDelete(null);
    } catch (err) {
      console.error("Failed to delete movie:", err);
      alert("Gagal menghapus movie.");
    }
  };

  if (loadingRole) return <p>Loading user data...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin Movie List</h1>

      <button
        onClick={() => setShowAdd(true)}
        style={{
          marginBottom: "1rem",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          padding: "0.6rem 1rem",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        + Add New Movie
      </button>

      {loadingMovies ? (
        <p>Loading movies...</p>
      ) : movies.length === 0 ? (
        <p>No movies found.</p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gap: "1.5rem",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            }}
          >
            {movies.map((movie) => (
              <div
                key={movie.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Link
                  href={`/admin/movie/${movie.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <img
                    src={movie.coverUrl}
                    alt={movie.title}
                    style={{
                      width: "100%",
                      height: "160px",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                  />
                  <div style={{ padding: "1rem", flex: 1 }}>
                    <h3 style={{ margin: 0 }}>{movie.title}</h3>
                    <p style={{ margin: "0.3rem 0" }}>
                      <strong>Genre:</strong> {movie.genre?.join(", ")}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Rating:</strong> {movie.rating}
                    </p>
                  </div>
                </Link>

                <div style={{ padding: "1rem", marginTop: "auto" }}>
                <button
                 onClick={() => router.push(`/admin/movie/${movie.id}`)}
                 style={{
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    padding: "0.4rem 0.8rem",
                    borderRadius: "4px",
                    cursor: "pointer",
                    width: "100%",
                    marginBottom: "0.5rem"
                    }}
                  >
                    View Detail
                  </button>
                    
                  <button
                    onClick={() => setEditMovie(movie)}
                    style={{
                      backgroundColor: "#0070f3",
                      color: "white",
                      border: "none",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      width: "100%",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(movie)}
                    style={{
                      backgroundColor: "crimson",
                      color: "white",
                      border: "none",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div style={{ marginTop: "2rem", textAlign: "center" }}>
              <button
                onClick={() => fetchMovies(lastDoc)}
                style={{
                  padding: "0.6rem 1.2rem",
                  borderRadius: "4px",
                  backgroundColor: "#555",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        show={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        collectionName={confirmDelete?.title}
      />

      <AddMovieModal
        show={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={() => fetchMovies()}
      />

      <EditMovieModal
        movie={editMovie}
        onClose={() => setEditMovie(null)}
        onUpdated={() => {
          fetchMovies();
          setEditMovie(null);
        }}
      />
    </div>
  );
}
