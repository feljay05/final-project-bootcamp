import { render, screen, fireEvent } from "@testing-library/react";
import MovieCard from "@/components/MovieCard";
import { useRouter } from "next/router";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("MovieCard", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({ push: mockPush });
  });

  const dummyMovie = {
    id: 1,
    title: "Inception",
    genre: ["Action", "Sci-Fi", "Thriller"],
    duration: 148,
    rating: 8.8,
    coverUrl: "https://picsum.photos/800/450",
  };

  it("renders movie details correctly", () => {
    render(<MovieCard movie={dummyMovie} />);
    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("Action, Sci-Fi, Thriller")).toBeInTheDocument();
    expect(screen.getByText(/Duration:/)).toBeInTheDocument("148 min");
    expect(screen.getByText(/Rating:/)).toBeInTheDocument("8.8");
    expect(screen.getByRole("button", { name: /view detail/i })).toBeInTheDocument();
  });

  it("navigates to detail page on button click", () => {
    render(<MovieCard movie={dummyMovie} />);
    fireEvent.click(screen.getByRole("button", { name: /view detail/i }));
    expect(mockPush).toHaveBeenCalledWith("/movie/1");
  });
});
