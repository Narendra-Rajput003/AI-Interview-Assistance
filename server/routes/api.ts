import express from 'express';
import * as db from '../services/databaseService';

const router = express.Router();

// Candidates routes
router.post('/candidates', async (req, res) => {
  try {
    const candidate = await db.createCandidate(req.body);
    res.json(candidate);
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

router.get('/candidates', async (req, res) => {
  try {
    const candidates = await db.getAllCandidates();
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

router.get('/candidates/:id', async (req, res) => {
  try {
    const candidate = await db.getCandidateById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

router.put('/candidates/:id', async (req, res) => {
  try {
    const candidate = await db.updateCandidate(req.params.id, req.body);
    res.json(candidate);
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

// Questions routes
router.get('/candidates/:candidateId/questions', async (req, res) => {
  try {
    const questions = await db.getQuestionsForCandidate(req.params.candidateId);
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

router.post('/questions', async (req, res) => {
  try {
    const question = await db.createQuestion(req.body);
    res.json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Answers routes
router.post('/answers', async (req, res) => {
  try {
    const answer = await db.createAnswer(req.body);
    res.json(answer);
  } catch (error) {
    console.error('Error creating answer:', error);
    res.status(500).json({ error: 'Failed to create answer' });
  }
});

export default router;