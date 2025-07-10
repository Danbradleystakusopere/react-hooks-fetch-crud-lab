import React from "react";

function QuestionList({ questions, onDelete, onUpdate }) {
  function handleDeleteClick(id) {
    fetch(`http://localhost:4000/questions/${id}`, {
      method: "DELETE",
    }).then(() => onDelete(id));
  }

  function handleCorrectAnswerChange(id, newIndex) {
    fetch(`http://localhost:4000/questions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correctIndex: parseInt(newIndex, 10) }),
    })
      .then((res) => res.json())
      .then((updatedQuestion) => onUpdate(updatedQuestion));
  }

  return (
    <ul>
      {questions.map((q) => (
        <li key={q.id}>
          <h4>{q.prompt}</h4>
          <label>
            Correct Answer:
            <select
              value={q.correctIndex}
              onChange={(e) => handleCorrectAnswerChange(q.id, e.target.value)}
            >
              {q.answers.map((a, index) => (
                <option key={index} value={index}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <button onClick={() => handleDeleteClick(q.id)}>Delete Question</button>
        </li>
      ))}
    </ul>
  );
}

export default QuestionList;
