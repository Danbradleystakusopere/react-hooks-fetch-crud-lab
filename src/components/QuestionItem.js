import React, { useState, useEffect } from "react";

function QuestionItem({ question, onDelete, onUpdate }) {
  const { id, prompt, answers, correctIndex } = question;
  const [selectedIndex, setSelectedIndex] = useState(correctIndex);

  useEffect(() => {
    setSelectedIndex(correctIndex);
  }, [correctIndex]);

  function handleAnswerChange(e) {
    const newIndex = parseInt(e.target.value, 10);
    setSelectedIndex(newIndex);

    fetch(`http://localhost:4000/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correctIndex: newIndex }),
    })
      .then((r) => r.json())
      .then((updatedQuestion) => onUpdate(updatedQuestion));
  }

  function handleDeleteClick() {
    fetch(`http://localhost:4000/questions/${id}`, {
      method: "DELETE",
    }).then(() => onDelete(id));
  }

  return (
    <li>
      <h4>{prompt}</h4>
      <label>
        Correct Answer:
        <select value={selectedIndex} onChange={handleAnswerChange}>
          {answers.map((answer, index) => (
            <option key={index} value={index}>
              {answer}
            </option>
          ))}
        </select>
      </label>
      <button onClick={handleDeleteClick}>Delete Question</button>
    </li>
  );
}

export default QuestionItem;
