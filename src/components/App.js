import React, { useState, useEffect } from "react";
import QuestionList from "./QuestionList";
import QuestionForm from "./QuestionForm";

function App() {
  const [questions, setQuestions] = useState([]);
  const [view, setView] = useState("form");

  useEffect(() => {
    const controller = new AbortController();

    fetch("http://localhost:4000/questions", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
        }
      });

    return () => controller.abort();
  }, []);

  function handleAddQuestion(newQuestion) {
    setQuestions((prev) => [...prev, newQuestion]);
    setView("list");
  }

  function handleDeleteQuestion(id) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function handleUpdateQuestion(updatedQuestion) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
  }

  return (
    <main>
      <nav>
        <button onClick={() => setView("form")}>New Question</button>
        <button onClick={() => setView("list")}>View Questions</button>
      </nav>
      {view === "form" ? (
        <QuestionForm onAddQuestion={handleAddQuestion} />
      ) : (
        <QuestionList
          questions={questions}
          onDelete={handleDeleteQuestion}
          onUpdate={handleUpdateQuestion}
        />
      )}
    </main>
  );
}

export default App;
