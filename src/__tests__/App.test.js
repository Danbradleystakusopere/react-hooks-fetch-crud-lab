import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../components/App";

// Mock questions
const mockQuestions = [
  {
    id: 1,
    prompt: "lorem testum 1",
    answers: ["A", "B", "C", "D"],
    correctIndex: 2,
  },
  {
    id: 2,
    prompt: "lorem testum 2",
    answers: ["A", "B", "C", "D"],
    correctIndex: 1,
  },
];

// Setup global.fetch mock
beforeEach(() => {
  global.fetch = jest.fn((url, options) => {
    if (options?.method === "POST") {
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            id: 3,
            prompt: "New Test Question",
            answers: ["Answer A", "Answer B", "Answer C", "Answer D"],
            correctIndex: 2,
          }),
      });
    }

    if (options?.method === "PATCH") {
      return Promise.resolve({ json: () => Promise.resolve({}) });
    }

    if (options?.method === "DELETE") {
      return Promise.resolve({ ok: true });
    }

    return Promise.resolve({
      json: () => Promise.resolve(mockQuestions),
    });
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test("displays question prompts after fetching", async () => {
  render(<App />);
  fireEvent.click(screen.getByText("View Questions"));

  expect(await screen.findByText(/lorem testum 1/i)).toBeInTheDocument();
  expect(await screen.findByText(/lorem testum 2/i)).toBeInTheDocument();
});

test("creates a new question when the form is submitted", async () => {
  render(<App />);
  fireEvent.click(screen.getByText("New Question"));

  fireEvent.change(screen.getByLabelText("Prompt:"), {
    target: { value: "New Test Question" },
  });

  const answerInputs = screen.getAllByLabelText(/Answer \d:/i);
  fireEvent.change(answerInputs[0], { target: { value: "Answer A" } });
  fireEvent.change(answerInputs[1], { target: { value: "Answer B" } });
  fireEvent.change(answerInputs[2], { target: { value: "Answer C" } });
  fireEvent.change(answerInputs[3], { target: { value: "Answer D" } });

  fireEvent.change(screen.getByLabelText("Correct Answer:"), {
    target: { value: "2" },
  });

  fireEvent.click(screen.getByText("Add Question"));
  fireEvent.click(screen.getByText("View Questions"));

  expect(await screen.findByText(/lorem testum 1/i)).toBeInTheDocument();
});

test("deletes the question when the delete button is clicked", async () => {
  render(<App />);
  fireEvent.click(screen.getByText("View Questions"));

  await screen.findByText(/lorem testum 1/i);
  const deleteButtons = screen.getAllByText("Delete Question");

  fireEvent.click(deleteButtons[0]);

  await waitFor(() => {
    expect(screen.queryByText(/lorem testum 1/i)).not.toBeInTheDocument();
  });
});

test("updates the answer when the dropdown is changed", async () => {
  render(<App />);
  fireEvent.click(screen.getByText("View Questions"));

  await screen.findByText(/lorem testum 2/i);

  const dropdowns = screen.getAllByLabelText(/Correct Answer/i);
  fireEvent.change(dropdowns[1], { target: { value: "3" } });

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining("/questions/2"),
    expect.objectContaining({
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correctIndex: 3 }),
    })
  );
});
