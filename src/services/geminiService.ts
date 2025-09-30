import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function generateQuestion(
  difficulty: 'easy' | 'medium' | 'hard',
  resumeText: string,
  previousQuestions: string[] = []
): Promise<string> {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-002' });

      // Extract candidate skills first to tailor questions
      const skills = await extractCandidateSkills(resumeText);

      // Create difficulty-appropriate prompts
      const difficultyPrompts = {
        easy: `Generate a basic technical question suitable for a junior developer. Focus on fundamental concepts, syntax, and basic problem-solving.`,
        medium: `Generate an intermediate technical question suitable for a mid-level developer. Include practical implementation, best practices, and architectural decisions.`,
        hard: `Generate an advanced technical question suitable for a senior developer. Focus on system design, scalability, performance optimization, and complex problem-solving.`
      };

      const prompt = `You are an expert technical interviewer. Generate ONE COMPLETELY UNIQUE technical interview question based on the candidate's resume and skills.

CRITICAL: NEVER REPEAT ANY PREVIOUS QUESTIONS. Each question must be entirely different in topic, concept, and wording.

CANDIDATE SKILLS & EXPERIENCE:
- Technologies: ${skills.technologies.join(', ')}
- Experience Level: ${skills.experienceLevel}
- Domains: ${skills.domains.join(', ')}

QUESTION REQUIREMENTS:
- Difficulty: ${difficulty.toUpperCase()}
- ${difficultyPrompts[difficulty]}
- Question should be relevant to their background and technologies mentioned
- Make it practical and job-related
- Avoid questions about technologies not mentioned in their resume
- Keep it concise but comprehensive
- MOST IMPORTANT: The question MUST be completely unique and different from all previous questions

${previousQuestions.length > 0 ? `STRICTLY FORBIDDEN QUESTIONS (DO NOT ASK ANY OF THESE):
${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

WARNING: If you generate any question similar to the ones above, it will be considered a critical failure.
You MUST create a question on a completely different topic, technology, or concept.
Choose a different aspect of their skills or experience that hasn't been tested yet.` : ''}

QUESTION FORMAT:
Return ONLY the question text, nothing else. Make it clear and professional.

RESUME CONTEXT:
${resumeText.substring(0, 1500)}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const question = response.text().trim();

      // Clean up the response
      const cleanQuestion = question.replace(/^["']|["']$/g, '').trim();

      // Check if the question is unique (not too similar to previous questions)
      if (cleanQuestion && cleanQuestion.length >= 10 && isQuestionUnique(cleanQuestion, previousQuestions)) {
        return cleanQuestion;
      }

      // If not unique or too short, try again
      console.warn(`Attempt ${attempt + 1}: Generated question was not unique or too short, retrying...`);
      if (attempt === maxRetries - 1) {
        // Last attempt, use fallback
        return getFallbackQuestion(difficulty, previousQuestions);
      }

    } catch (error) {
      console.error(`Error generating question (attempt ${attempt + 1}):`, error);
      if (attempt === maxRetries - 1) {
        // Last attempt, use fallback
        return getFallbackQuestion(difficulty, previousQuestions);
      }
    }
  }

  // This should never be reached, but just in case
  return getFallbackQuestion(difficulty, previousQuestions);
}

// Helper function to check if a question is unique compared to previous questions
function isQuestionUnique(question: string, previousQuestions: string[]): boolean {
  if (previousQuestions.length === 0) return true;

  const normalizedQuestion = question.toLowerCase().trim();

  for (const prevQuestion of previousQuestions) {
    const normalizedPrev = prevQuestion.toLowerCase().trim();

    // Exact match
    if (normalizedQuestion === normalizedPrev) {
      return false;
    }

    // Check for high similarity (simple word overlap check)
    const questionWords = new Set(normalizedQuestion.split(/\s+/).filter(word => word.length > 3));
    const prevWords = new Set(normalizedPrev.split(/\s+/).filter(word => word.length > 3));

    const intersection = new Set([...questionWords].filter(word => prevWords.has(word)));
    const union = new Set([...questionWords, ...prevWords]);

    const similarity = intersection.size / union.size;

    // If more than 60% word overlap, consider it too similar
    if (similarity > 0.6) {
      return false;
    }
  }

  return true;
}

// Fallback function for when AI fails
function getFallbackQuestion(difficulty: 'easy' | 'medium' | 'hard', previousQuestions: string[] = []): string {
  const fallbacks = {
    easy: [
      "Explain the difference between var, let, and const in JavaScript.",
      "What is the purpose of the useState hook in React?",
      "How do you handle events in React components?",
      "What is the difference between props and state in React?",
      "How do you create a functional component in React?",
      "What is JSX and how does it work?",
      "Explain the component lifecycle in React.",
      "How do you pass data between parent and child components?"
    ],
    medium: [
      "How would you optimize a React component's performance?",
      "Explain how you would implement error handling in a React application.",
      "What are the benefits of using TypeScript in a React project?",
      "How do you manage state in a complex React application?",
      "Explain the concept of React Context and when to use it.",
      "How would you implement routing in a React application?",
      "What are React hooks and how do they differ from class components?",
      "How do you handle asynchronous operations in React?"
    ],
    hard: [
      "Design a scalable architecture for a React application with multiple data sources.",
      "How would you implement authentication and authorization in a full-stack application?",
      "Explain your approach to testing a complex React application.",
      "How would you optimize bundle size and loading performance in a large React app?",
      "Describe your strategy for state management in a large-scale React application.",
      "How would you implement code splitting and lazy loading in React?",
      "Explain how you would handle security vulnerabilities in a React application.",
      "Design a microservices architecture for a complex web application."
    ]
  };

  const questions = fallbacks[difficulty];

  // Filter out questions that are too similar to previous ones
  const availableQuestions = questions.filter(q => isQuestionUnique(q, previousQuestions));

  if (availableQuestions.length === 0) {
    // If all fallback questions are used, return a generic one
    return `Describe your experience with ${difficulty} level development tasks.`;
  }

  return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
}

export async function calculateScore(
  question: string,
  answer: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<{ score: number; feedback: string }> {
  // Check for no answer first - give 0/10
  const answerText = answer.trim();
  if (answerText === '' || answerText === 'No answer provided (time expired)' ||
      answerText.toLowerCase().includes('no answer') ||
      answerText.length < 5) {
    return {
      score: 0,
      feedback: 'No answer provided. (Score: 0/10)'
    };
  }

  // Initialize scoring variables
  let score = 0;
  const answerLength = answerText.length;

  // Base scoring by difficulty and length
  if (difficulty === 'easy') {
    if (answerLength < 50) score = 2;
    else if (answerLength < 100) score = 4;
    else if (answerLength < 200) score = 6;
    else score = 8;
  } else if (difficulty === 'medium') {
    if (answerLength < 80) score = 2;
    else if (answerLength < 150) score = 4;
    else if (answerLength < 250) score = 6;
    else score = 8;
  } else { // hard
    if (answerLength < 100) score = 1;
    else if (answerLength < 200) score = 3;
    else if (answerLength < 300) score = 5;
    else score = 7;
  }

  // Technical accuracy check - must have relevant terms
  const technicalTerms = {
    easy: /\b(javascript|react|html|css|dom|function|variable|array|object|string|number|jsx|component|props|state)\b/i,
    medium: /\b(api|state|props|hooks|async|promise|node|express|database|component|event|callback|middleware|route|query)\b/i,
    hard: /\b(architecture|scalability|performance|security|optimization|microservices|design|pattern|algorithm|cache|load|balancing|distributed|concurrency)\b/i
  };

  const hasTechnicalTerms = technicalTerms[difficulty].test(answerText);
  if (!hasTechnicalTerms) {
    score = Math.max(0, score - 3); // Heavy penalty for missing technical content
  } else {
    score += 1; // Bonus for relevant terms
  }

  // Quality indicators - explanations, examples, code
  const hasExplanation = /\b(because|since|due to|therefore|so|thus|as a result|this means|which allows|by using|through|via)\b/i.test(answerText);
  const hasExamples = /\b(for example|such as|like|e\.g\.|i\.e\.|specifically|in particular|instance|case)\b/i.test(answerText);
  const hasCode = /[`<>(){}[\]=]|\bconst\b|\blet\b|\bfunction\b|\bclass\b|\bimport\b|\bexport\b/.test(answerText);

  if (hasExplanation) score += 1;
  if (hasExamples) score += 1;
  if (hasCode && difficulty !== 'easy') score += 1; // Code examples more valuable for medium/hard

  // Penalize for irrelevant or wrong answers
  const irrelevantPatterns = /\b(i don't know|no idea|not sure|maybe|perhaps|guess|unclear|confused)\b/i;
  const wrongPatterns = /\b(wrong|incorrect|mistake|error|faulty)\b/i;

  if (irrelevantPatterns.test(answerText)) {
    score = Math.max(0, score - 2);
  }
  if (wrongPatterns.test(answerText)) {
    score = Math.max(0, score - 3);
  }

  // Ensure score is within valid range
  score = Math.max(0, Math.min(10, score));

  // Generate detailed feedback
  let feedback = '';
  if (score >= 9) {
    feedback = 'Outstanding! Comprehensive, technically accurate, and well-explained answer.';
  } else if (score >= 7) {
    feedback = 'Excellent answer with strong technical understanding and good examples.';
  } else if (score >= 5) {
    feedback = 'Good answer showing solid knowledge. Could use more depth and examples.';
  } else if (score >= 3) {
    feedback = 'Basic answer with some correct information but lacking depth and accuracy.';
  } else if (score >= 1) {
    feedback = 'Poor answer. Shows minimal understanding of the topic.';
  } else {
    feedback = 'No answer provided or completely incorrect.';
  }

  return {
    score,
    feedback: `${feedback} (Score: ${score}/10)`
  };
}

export async function generateFinalSummary(
  candidateName: string,
  answers: Array<{
    question: string;
    answer: string;
    score: number;
    difficulty: string;
  }>,
  finalScore: number
): Promise<string> {
  // Skip AI call for speed - use instant summary generation
  const performance = finalScore >= 8 ? 'excellent' :
                     finalScore >= 6 ? 'good' :
                     finalScore >= 4 ? 'adequate' : 'developing';

  const recommendation = finalScore >= 8 ? 'Strong Hire' :
                        finalScore >= 6 ? 'Hire' :
                        finalScore >= 4 ? 'Maybe' : 'No Hire';

  const avgScore = answers.reduce((sum, a) => sum + a.score, 0) / answers.length;
  const strengths = avgScore >= 6 ? 'demonstrated solid technical knowledge and problem-solving skills' :
                   'showed basic understanding of key concepts';

  return `${candidateName} completed the technical interview with an overall score of ${finalScore}/10, demonstrating ${performance} full-stack development skills. The candidate ${strengths} throughout the assessment. Based on the performance, our recommendation is: ${recommendation}.`;
}

export async function extractCandidateSkills(resumeText: string): Promise<{
  technologies: string[];
  experienceLevel: 'junior' | 'mid' | 'senior';
  domains: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-002' });

    const prompt = `Analyze the following resume and extract:
    1. Key technologies and programming languages mentioned
    2. Experience level (junior/mid/senior) based on years of experience and complexity of projects
    3. Main domains/industries mentioned

    Resume Text:
    ${resumeText.substring(0, 2000)}

    Return the analysis in JSON format:
    {
      "technologies": ["React", "Node.js", "TypeScript", "MongoDB"],
      "experienceLevel": "mid",
      "domains": ["web development", "e-commerce", "fintech"]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    try {
      const parsed = JSON.parse(text);
      return {
        technologies: Array.isArray(parsed.technologies) ? parsed.technologies : [],
        experienceLevel: ['junior', 'mid', 'senior'].includes(parsed.experienceLevel) ? parsed.experienceLevel : 'mid',
        domains: Array.isArray(parsed.domains) ? parsed.domains : [],
      };
    } catch (parseError) {
      console.error('Error parsing candidate skills from AI response:', parseError);
      return { technologies: [], experienceLevel: 'mid', domains: [] };
    }
  } catch (error) {
    console.error('Error extracting candidate skills with AI:', error);
    return { technologies: [], experienceLevel: 'mid', domains: [] };
  }
}

export async function extractCandidateInfoWithAI(resumeText: string): Promise<{ name?: string; email?: string; phone?: string }> {
  try {
    // Try different models
    const models = ['gemini-1.5-pro-002', 'gemini-1.5-flash-002', 'gemini-pro'];

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `You are an expert at extracting contact information from resumes.

RESUME TEXT:
${resumeText.substring(0, 4000)}

TASK: Extract the candidate's contact information. Look carefully for:

1. NAME: The person's full name (usually at the very top of the resume)
2. EMAIL: Email address containing @ symbol
3. PHONE: Phone number in any format (e.g., (555) 123-4567, 555-123-4567, +1 555 123 4567, etc.)

IMPORTANT:
- Be very careful and accurate
- Only extract information that actually appears in the resume
- If you can't find something, use null
- Look at the very beginning of the resume for the name
- Email usually contains @ and .com/.org/etc.
- Phone numbers contain digits and may have parentheses, dashes, or spaces

Return your answer as a JSON object with exactly this format:
{"name": "John Smith", "email": "john@email.com", "phone": "(555) 123-4567"}

If any field is not found, use null instead of an empty string.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        // Clean up the response
        const cleanText = text.replace(/```json\s*|\s*```/g, '').trim();

    

        try {
          const parsed = JSON.parse(cleanText);

          // Validate the extracted data
          const result = {
            name: (parsed.name && typeof parsed.name === 'string' && parsed.name.length > 1) ? parsed.name : undefined,
            email: (parsed.email && typeof parsed.email === 'string' && parsed.email.includes('@')) ? parsed.email : undefined,
            phone: (parsed.phone && typeof parsed.phone === 'string' && /\d/.test(parsed.phone)) ? parsed.phone : undefined,
          };

          // If we got at least one valid field, return the result
          if (result.name || result.email || result.phone) {
      
            return result;
          }
        } catch (parseError) {
          console.warn('JSON parse error for model', modelName, ':', parseError);
          continue;
        }
      } catch (modelError) {
        console.warn('Model', modelName, 'failed:', modelError);
        continue;
      }
    }

    // If all models failed, try manual extraction
   
    return extractContactInfoManually(resumeText);

  } catch (error) {
    console.error('Error extracting candidate info with AI:', error);
    return extractContactInfoManually(resumeText);
  }
}

// Fallback manual extraction function
function extractContactInfoManually(resumeText: string): { name?: string; email?: string; phone?: string } {
  const result: { name?: string; email?: string; phone?: string } = {};

  // Extract email - improved regex
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi;
  const emailMatch = resumeText.match(emailRegex);
  if (emailMatch && emailMatch.length > 0) {
    result.email = emailMatch[0].toLowerCase();
  }

  // Extract phone - multiple patterns
  const phonePatterns = [
    /(\+?\d{1,3}[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/g, // (555) 123-4567
    /(\+?\d{1,3}[-.\s]?)?(\d{3})[-.\s]?(\d{3})[-.\s]?(\d{4})/g, // 555-123-4567
    /(\+?\d{1,3}[-.\s]?)?(\d{3})\.(\d{3})\.(\d{4})/g, // 555.123.4567
    /(\+?\d{1,3}[-.\s]?)?(\d{10})/g, // 5551234567
  ];

  for (const pattern of phonePatterns) {
    const phoneMatch = resumeText.match(pattern);
    if (phoneMatch && phoneMatch.length > 0) {
      result.phone = phoneMatch[0];
      break;
    }
  }

  // Extract name - look for name patterns in the first part of the resume
  const textStart = resumeText.substring(0, 1000); // First 1000 chars
  const lines = textStart.split('\n').filter(line => line.trim().length > 0);

  for (const line of lines.slice(0, 5)) { // Check first 5 lines
    const trimmed = line.trim();
    // Skip lines that are too long, too short, or contain keywords
    if (trimmed.length < 3 || trimmed.length > 50) continue;
    if (/\b(email|phone|address|linkedin|github|website|summary|objective)\b/i.test(trimmed)) continue;
    if (/\d{4}/.test(trimmed)) continue; // Skip lines with years

    // Check if it looks like a name (title case words)
    const words = trimmed.split(/\s+/);
    if (words.length >= 1 && words.length <= 4) {
      const titleCaseWords = words.filter(word =>
        word.length > 1 && word[0] === word[0].toUpperCase()
      );
      if (titleCaseWords.length >= words.length * 0.5) { // At least 50% title case
        result.name = trimmed;
        break;
      }
    }
  }

  return result;
}