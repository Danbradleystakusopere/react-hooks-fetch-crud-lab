import React, { useState, useEffect } from "react";
import QuestionList from "./QuestionList";
import QuestionForm from "./QuestionForm";
import AdminNavBar from "./AdminNavBar";

function App() {
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState("List"); // default to List for tests

  useEffect(() => {
    const controller = new AbortController();

    fetch("http://localhost:4000/questions", { signal: controller.signal })
      .then((res) => res.json())
      .then(setQuestions)
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
        }
      });

    return () => controller.abort();
  }, []);

  function handleAddQuestion(newQuestion) {
    setQuestions((prev) => [...prev, newQuestion]);
    setPage("List");
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
      <AdminNavBar onChangePage={setPage} />
      {page === "Form" ? (
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
