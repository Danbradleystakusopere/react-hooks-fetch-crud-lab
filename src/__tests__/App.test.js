import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import App from "../components/App";

const sampleQuestions = [
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

beforeEach(() => {
  jest.spyOn(global, "fetch").mockImplementation((url, options = {}) => {
    if (
      url === "http://localhost:4000/questions" &&
      (!options.method || options.method === "GET")
    ) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(sampleQuestions),
      });
    }

    if (
      url === "http://localhost:4000/questions" &&
      options.method === "POST"
    ) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 3,
            prompt: "lorem testum 3",
            answers: ["e", "f", "g", "h"],
            correctIndex: 1,
          }),
      });
    }

    if (
      url === "http://localhost:4000/questions/2" &&
      options.method === "PATCH"
    ) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ ...sampleQuestions[1], correctIndex: 3 }),
      });
    }

    if (
      url.startsWith("http://localhost:4000/questions/") &&
      options.method === "DELETE"
    ) {
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
  });

  const newQuestionButtons = screen.getAllByText("New Question");
  const navButton = newQuestionButtons.find(
    (el) => el.tagName.toLowerCase() === "button"
  );
  fireEvent.click(navButton);

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

  fireEvent.click(screen.getByRole("button", { name: /add question/i }));

  fireEvent.click(screen.getByText("View Questions"));

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
