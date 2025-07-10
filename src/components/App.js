import React, { useState, useEffect } from "react";
import AdminNavBar from "./AdminNavBar";
import QuestionForm from "./QuestionForm";
import QuestionList from "./QuestionList";

function App() {
  const [page, setPage] = useState("List");
  const [questions, setQuestions] = useState([]);

  // ✅ Extract fetch logic to reuse
  function fetchQuestions(signal) {
    fetch("http://localhost:4000/questions", { signal })
      .then((r) => r.json())
      .then((data) => setQuestions(data))
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
        }
      });
  }

  useEffect(() => {
    const controller = new AbortController();
    fetchQuestions(controller.signal);

    return () => controller.abort();
  }, []);

  function handleChangePage(newPage) {
    setPage(newPage);

    if (newPage === "List") {
      const controller = new AbortController();
      fetchQuestions(controller.signal);
    }
  }

  return (
    <main>
      <AdminNavBar onChangePage={handleChangePage} />
      {page === "Form" ? (
        <QuestionForm
          questions={questions}
          setQuestions={setQuestions}
          onChangePage={handleChangePage}
        />
      ) : (
        <QuestionList questions={questions} setQuestions={setQuestions} />
      )}
    </main>
  );
}

export default App;
