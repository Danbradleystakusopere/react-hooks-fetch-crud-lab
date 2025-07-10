import React from "react";
import QuestionItem from "./QuestionItem";

function QuestionList({ questions, setQuestions }) {
  return (
    <ul>
      {questions.map((q) => (
        <QuestionItem key={q.id} question={q} setQuestions={setQuestions} />
      ))}
    </ul>
  );
}

export default QuestionList;

