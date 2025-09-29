// Mock AI service - replace with actual AI API calls
export async function generateQuestion(difficulty: 'easy' | 'medium' | 'hard'): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const questions = {
    easy: [
      "What is the difference between let, const, and var in JavaScript?",
      "Explain what React components are and how they work.",
      "What is the purpose of the useState hook in React?",
      "How do you handle events in React?",
      "What is the difference between props and state in React?"
    ],
    medium: [
      "How would you optimize the performance of a React application?",
      "Explain the concept of closures in JavaScript with an example.",
      "What are React hooks and why were they introduced?",
      "How would you handle asynchronous operations in React?",
      "Explain the difference between REST and GraphQL APIs."
    ],
    hard: [
      "Design a scalable architecture for a full-stack web application with React and Node.js.",
      "How would you implement authentication and authorization in a modern web application?",
      "Explain how you would handle state management in a large React application.",
      "Describe your approach to testing React components and Node.js applications.",
      "How would you optimize database queries and handle data relationships in a Node.js application?"
    ]
  };
  
  const questionList = questions[difficulty];
  return questionList[Math.floor(Math.random() * questionList.length)];
}

export async function calculateScore(question: string, answer: string): Promise<number> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock scoring logic - replace with actual AI scoring
  const baseScore = Math.floor(Math.random() * 4) + 6; // Random score between 6-10
  const answerLength = answer.trim().length;
  
  if (answerLength < 10) return Math.max(1, baseScore - 3);
  if (answerLength < 50) return Math.max(3, baseScore - 2);
  if (answerLength > 200) return Math.min(10, baseScore + 1);
  
  return baseScore;
}