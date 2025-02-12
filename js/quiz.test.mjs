import { expect } from 'chai';
import { Quiz } from './quiz.mjs';

describe('Quiz Class', () => {
  const questions = [
    { question: "What is the capital of France?", answer: "Paris" },
    { question: "What is the capital of Germany?", answer: "Berlin" },
    { question: "What is the capital of Italy?", answer: "Rome" }
  ];

  let quiz;

  beforeEach(() => {
    quiz = new Quiz(questions);
  });

  it('should initialize with correct properties', () => {
    expect(quiz.questions).to.deep.equal(questions);
    expect(quiz.currentQuestionIndex).to.equal(0);
    expect(quiz.askedQuestions.size).to.equal(0);
    expect(quiz.goodAnswers.length).to.equal(0);
    expect(quiz.badAnswers.length).to.equal(0);
  });

  it('should get a random question', () => {
    const question = quiz.getNextQuestion();
    expect(questions).to.include(question);
    expect(quiz.askedQuestions.size).to.equal(1);
  });

  it('should record a correct answer', () => {
    quiz.getNextQuestion();
    const progress = quiz.recordAnswer(true);
    expect(quiz.goodAnswers.length).to.equal(1);
    expect(quiz.badAnswers.length).to.equal(0);
    expect(progress.goodAnswers).to.equal(1);
    expect(progress.badAnswers).to.equal(0);
  });

  it('should record an incorrect answer', () => {
    quiz.getNextQuestion();
    const progress = quiz.recordAnswer(false);
    expect(quiz.goodAnswers.length).to.equal(0);
    expect(quiz.badAnswers.length).to.equal(1);
    expect(progress.goodAnswers).to.equal(0);
    expect(progress.badAnswers).to.equal(1);
  });

  it('should reset the quiz', () => {
    quiz.getNextQuestion();
    quiz.recordAnswer(true);
    quiz.resetQuiz();
    expect(quiz.currentQuestionIndex).to.equal(0);
    expect(quiz.askedQuestions.size).to.equal(0);
    expect(quiz.goodAnswers.length).to.equal(0);
    expect(quiz.badAnswers.length).to.equal(0);
  });

  it('should get the correct progress', () => {
    quiz.getNextQuestion();
    quiz.recordAnswer(true);
    const progress = quiz.getProgress();
    expect(progress.totalQuestions).to.equal(questions.length);
    expect(progress.questionsAsked).to.equal(1);
    expect(progress.goodAnswers).to.equal(1);
    expect(progress.badAnswers).to.equal(0);
  });
});