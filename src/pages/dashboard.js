import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import MovieCard from "@/components/MovieCard";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 10;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setLoading(false);
        router.push("/login");
      } else {
        fetchMovies();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchMovies = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "movies"));
      const moviesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMovies(moviesData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  const indexOfLast = currentPage * moviesPerPage;
  const indexOfFirst = indexOfLast - moviesPerPage;
  const currentMovies = movies.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(movies.length / moviesPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div style={{ padding: "2rem" }}>
        <h1>Movie List</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {currentMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                backgroundColor: currentPage === 1 ? "#ccc" : "#0070f3",
                color: "#fff",
                border: "none",
                cursor: currentPage === 1 ? "default" : "pointer",
              }}
            >
              Prev
            </button>
            <span style={{ alignSelf: "center" }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                backgroundColor: currentPage === totalPages ? "#ccc" : "#0070f3",
                color: "#fff",
                border: "none",
                cursor: currentPage === totalPages ? "default" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}
