import React from "react";
import "whatwg-fetch";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { server } from "../mocks/server";

import App from "../components/App";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("displays question prompts after fetching", async () => {
  render(<App />);
  fireEvent.click(screen.getByText(/View Questions/));

  await waitFor(() => {
    expect(screen.getByText(/lorem testum 1/i)).toBeInTheDocument();
    expect(screen.getByText(/lorem testum 2/i)).toBeInTheDocument();
  });
});

test("creates a new question when the form is submitted", async () => {
  render(<App />);
  await screen.findByText(/View Questions/);
  fireEvent.click(screen.getByText(/New Question/));

  fireEvent.change(screen.getByLabelText(/Prompt/), {
    target: { value: "Test Prompt" },
  });
  fireEvent.change(screen.getByLabelText(/Answer 1/), {
    target: { value: "Test Answer 1" },
  });
  fireEvent.change(screen.getByLabelText(/Answer 2/), {
    target: { value: "Test Answer 2" },
  });
  fireEvent.change(screen.getByLabelText(/Correct Answer/), {
    target: { value: "1" },
  });

  fireEvent.click(screen.getByText(/Add Question/));

  fireEvent.click(screen.getByText(/View Questions/));

  await waitFor(() => {
    expect(screen.getByText(/Test Prompt/)).toBeInTheDocument();
    expect(screen.getByText(/lorem testum 1/)).toBeInTheDocument();
  });
});

test("deletes the question when the delete button is clicked", async () => {
  const { rerender } = render(<App />);
  fireEvent.click(screen.getByText(/View Questions/));

  await screen.findByText(/lorem testum 1/);
  fireEvent.click(screen.getAllByText("Delete Question")[0]);

  await waitForElementToBeRemoved(() =>
    screen.queryByText(/lorem testum 1/)
  );

  rerender(<App />);
  await screen.findByText(/lorem testum 2/);
  expect(screen.queryByText(/lorem testum 1/)).not.toBeInTheDocument();
});

test("updates the answer when the dropdown is changed", async () => {
  const { rerender } = render(<App />);
  fireEvent.click(screen.getByText(/View Questions/));

  await screen.findByText(/lorem testum 2/);

  fireEvent.change(screen.getAllByLabelText(/Correct Answer/)[0], {
    target: { value: "3" },
  });

  await waitFor(() => {
    expect(screen.getAllByLabelText(/Correct Answer/)[0].value).toBe("3");
  });

  rerender(<App />);

  expect(screen.getAllByLabelText(/Correct Answer/)[0].value).toBe("3");
});
