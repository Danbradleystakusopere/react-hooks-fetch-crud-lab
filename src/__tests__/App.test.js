import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import App from "../components/App";

// Maintain persistent backend state
let currentQuestions;

beforeEach(() => {
  // Reset mock data before each test
  currentQuestions = [
    {
      id: 1,
      prompt: "lorem testum 1",
      answers: ["a", "b", "c", "d"],
      correctIndex: 2,
    },
    {
      id: 2,
      prompt: "lorem testum 2",
      answers: ["x", "y", "z", "w"],
      correctIndex: 0,
    },
  ];

  jest.spyOn(global, "fetch").mockImplementation((url, options = {}) => {
    if (
      url === "http://localhost:4000/questions" &&
      (!options.method || options.method === "GET")
    ) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(currentQuestions),
      });
    }

    if (
      url === "http://localhost:4000/questions" &&
      options.method === "POST"
    ) {
      const newQuestion = {
        id: 3,
        prompt: "lorem testum 3",
        answers: ["e", "f", "g", "h"],
        correctIndex: 1,
      };
      currentQuestions.push(newQuestion);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(newQuestion),
      });
    }

    if (url === "http://localhost:4000/questions/2" && options.method === "PATCH") {
      currentQuestions = currentQuestions.map((q) =>
        q.id === 2 ? { ...q, correctIndex: 3 } : q
      );
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(
          currentQuestions.find((q) => q.id === 2)
        ),
      });
    }

    if (
      url.startsWith("http://localhost:4000/questions/") &&
      options.method === "DELETE"
    ) {
      const id = parseInt(url.split("/").pop());
      currentQuestions = currentQuestions.filter((q) => q.id !== id);
      return Promise.resolve({ ok: true });
    }

    return Promise.reject(new Error("Unhandled fetch: " + url));
  });
});

afterEach(() => {
  global.fetch.mockRestore();
});

test("displays question prompts after fetching", async () => {
  await act(async () => {
    render(<App />);
    fireEvent.click(screen.getByText("View Questions"));
  });

  expect(await screen.findByText(/lorem testum 1/i)).toBeInTheDocument();
  expect(await screen.findByText(/lorem testum 2/i)).toBeInTheDocument();
});

test("creates a new question when the form is submitted", async () => {
  await act(async () => {
    render(<App />);
    fireEvent.click(screen.getAllByText("New Question")[0]);

    fireEvent.change(screen.getByLabelText(/Prompt/i), {
      target: { value: "lorem testum 3" },
    });
    fireEvent.change(screen.getByLabelText(/Answer 1/i), {
      target: { value: "e" },
    });
    fireEvent.change(screen.getByLabelText(/Answer 2/i), {
      target: { value: "f" },
    });
    fireEvent.change(screen.getByLabelText(/Answer 3/i), {
      target: { value: "g" },
    });
    fireEvent.change(screen.getByLabelText(/Answer 4/i), {
      target: { value: "h" },
    });
    fireEvent.change(screen.getByLabelText(/Correct Answer/i), {
      target: { value: "1" },
    });

    fireEvent.click(screen.getByText("Add Question"));
  });

  // After submission, it should switch to list view and include the new question
  expect(await screen.findByText(/lorem testum 3/i)).toBeInTheDocument();
});

test("deletes the question when the delete button is clicked", async () => {
  await act(async () => {
    render(<App />);
    fireEvent.click(screen.getByText("View Questions"));
  });

  await screen.findByText(/lorem testum 1/i);
  const deleteButtons = screen.getAllByText("Delete Question");

  await act(async () => {
    fireEvent.click(deleteButtons[0]);
  });

  await waitFor(() => {
    expect(screen.queryByText(/lorem testum 1/i)).not.toBeInTheDocument();
  });
});

test("updates the answer when the dropdown is changed", async () => {
  await act(async () => {
    render(<App />);
    fireEvent.click(screen.getByText("View Questions"));
  });

  await screen.findByText(/lorem testum 2/i);
  const selects = screen.getAllByLabelText(/Correct Answer/i);

  await act(async () => {
    fireEvent.change(selects[1], { target: { value: "3" } });
  });

  await waitFor(() => {
    expect(selects[1].value).toBe("3");
  });
});
