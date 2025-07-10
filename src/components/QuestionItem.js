import React, { useState, useEffect, useRef } from "react";

function QuestionItem({ question, setQuestions }) {
  const { id, prompt, answers } = question;
  const [correctIndex, setCorrectIndex] = useState(question.correctIndex);
  const isMounted = useRef(true); // ✅ Track if still mounted

  // ✅ Sync internal state if question prop changes
  useEffect(() => {
    setCorrectIndex(question.correctIndex);
  }, [question.correctIndex]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  function handleDelete() {
    fetch(`http://localhost:4000/questions/${id}`, {
      method: "DELETE",
    }).then(() => {
      if (isMounted.current) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      }
    });
  }

  function handleAnswerChange(e) {
    const newIndex = parseInt(e.target.value);
    setCorrectIndex(newIndex);

    fetch(`http://localhost:4000/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correctIndex: newIndex }),
    })
      .then((r) => r.json())
      .then((updatedQ) => {
        if (isMounted.current) {
          setQuestions((prev) =>
            prev.map((q) => (q.id === updatedQ.id ? updatedQ : q))
          );
        }
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
