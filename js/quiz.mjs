import log from './logging.mjs';
import { normalizeName } from './utils.mjs';

export class Quiz 
{
  /**
   *  Create a new quiz for the given array of questions.
   *  @param {*} questions The array of questions to ask, in random order.
   */
  constructor(questions) {
    this.questions = questions;
    this.currentQuestionIndex = 0;
    this.askedQuestions = new Set();
    this.goodAnswers = [];
    this.badAnswers = [];
  }
  
  /**
   *  Get a next question, if possible.
   *  @returns The next question to ask, or null if all questions have been asked.
   */
  getNextQuestion() {
    let totalQuestions = this.questions.length;
    if (this.askedQuestions.size >= totalQuestions) {
      return null; // All questions have been asked
    }

    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * totalQuestions);
    } 
    while (this.askedQuestions.has(randomIndex));

    this.askedQuestions.add(randomIndex);
    this.currentQuestionIndex = randomIndex;
    return this.questions[randomIndex];
  }

  getGoodAnswers() {
    return [...this.goodAnswers];
  }

  getBadAnswers() {
    return [...this.badAnswers];
  }

  /**
   *  Record the answer to the current question.
   * 
   *  @param {boolean} isCorrect True if the answer was correct, false otherwise.
   *  @returns The progress of the quiz.
   */
  recordAnswer(isCorrect) {
    let currentQuestion = this.questions[this.currentQuestionIndex];
    if (isCorrect) {
      this.goodAnswers.push(currentQuestion);
    }
    else {
      this.badAnswers.push(currentQuestion);
    }
    return this.getProgress();
  }

  /**
   * Get the current quiz status.
   * @returns The progress of the quiz.
   */
  getProgress() {
    return {
      totalQuestions: this.questions.length,
      questionsAsked: this.askedQuestions.size,
      goodAnswers: this.goodAnswers.length,
      badAnswers: this.badAnswers.length
    };
  }

  /**
   * Reset the quiz to start over, with the same questions as initially provided.
   */
  resetQuiz() {
    this.currentQuestionIndex = 0;
    this.goodAnswers = [];
    this.badAnswers = [];
    this.askedQuestions.clear();
  }
}
