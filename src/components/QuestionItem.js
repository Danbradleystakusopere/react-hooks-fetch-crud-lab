import React, { useState, useEffect } from "react";

function QuestionItem({ question, setQuestions }) {
  const { id, prompt, answers } = question;
  const [correctIndex, setCorrectIndex] = useState(question.correctIndex);

  // ✅ Sync internal state with prop updates
  useEffect(() => {
    setCorrectIndex(question.correctIndex);
  }, [question.correctIndex]);

  function handleDelete() {
    fetch(`http://localhost:4000/questions/${id}`, {
      method: "DELETE",
    }).then(() => {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    });
  }

  function handleAnswerChange(e) {
    const newIndex = parseInt(e.target.value);
    setCorrectIndex(newIndex); // ✅ Update immediately for dropdown
    fetch(`http://localhost:4000/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correctIndex: newIndex }),
    })
      .then((r) => r.json())
      .then((updatedQ) => {
        setQuestions((prev) =>
          prev.map((q) => (q.id === updatedQ.id ? updatedQ : q))
        );
      });
  }

  return (
    <li>
      <h4>{prompt}</h4>
      <label>
        Correct Answer:
        <select value={correctIndex} onChange={handleAnswerChange}>
          {answers.map((answer, index) => (
            <option key={index} value={index}>
              {answer}
            </option>
          ))}
        </select>
      </label>
      <button onClick={handleDelete}>Delete Question</button>
    </li>
  );
}

export default QuestionItem;
