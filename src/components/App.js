import React, { useState, useEffect } from "react";
import AdminNavBar from "./AdminNavBar";
import QuestionForm from "./QuestionForm";
import QuestionList from "./QuestionList";

function App() {
  const [page, setPage] = useState("List");
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    fetch("http://localhost:4000/questions", { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => setQuestions(data))
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
        }
      });

    // ✅ Cleanup to cancel fetch on unmount
    return () => controller.abort();
  }, []);

  function handleChangePage(newPage) {
    setPage(newPage);

    // OPTIONAL: only refetch if you want to reload data when returning to List
    if (newPage === "List") {
      const controller = new AbortController();
      fetch("http://localhost:4000/questions", { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => setQuestions(data))
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Fetch error:", err);
          }
        });
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
