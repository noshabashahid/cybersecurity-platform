import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Loader from '../components/Loader';
import api, { extractErrorMessage } from '../services/api';

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadQuiz = () => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    Promise.all([api.get('/quiz'), api.get('/quiz/my-attempts')])
      .then(([qRes, aRes]) => {
        setQuestions(qRes.data.data);
        setAttempts(aRes.data.data);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadQuiz(); }, []);

  const handleSubmit = async () => {
    const answerArray = Object.entries(answers).map(([questionId, selected]) => ({ questionId: Number(questionId), selected }));
    if (answerArray.length < questions.length) {
      setError('Please answer every question before submitting.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/quiz/submit', { answers: answerArray });
      setResult(res.data.data);
      const aRes = await api.get('/quiz/my-attempts');
      setAttempts(aRes.data.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><Loader label="Loading quiz…" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">🧠 Cybersecurity Security Quiz</h1>
      <p className="text-slate-500 text-sm mt-1">Test your knowledge of phishing, passwords, and online scams.</p>

      {error && <p className="text-sm text-accent-red mt-4">{error}</p>}

      {result ? (
        <div className="card p-8 mt-6 text-center">
          <p className="text-5xl font-extrabold text-accent-cyan">{result.percentage}%</p>
          <p className="text-slate-400 mt-2">You scored {result.score} out of {result.total}</p>
          <span className="badge bg-accent-purple/10 text-accent-purple border border-accent-purple/30 mt-3 inline-block">
            {result.performanceLevel}
          </span>

          <div className="text-left mt-8 space-y-4">
            {result.results.map((r, i) => (
              <div key={r.questionId} className={`p-4 rounded-lg border ${r.isCorrect ? 'border-accent-green/30 bg-accent-green/5' : 'border-accent-red/30 bg-accent-red/5'}`}>
                <p className="font-medium text-sm">{i + 1}. {r.question}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Your answer: {r.selected.toUpperCase()} {r.isCorrect ? '✓ Correct' : `✗ Incorrect (correct: ${r.correct.toUpperCase()})`}
                </p>
                {r.explanation && <p className="text-xs text-slate-400 mt-1">{r.explanation}</p>}
              </div>
            ))}
          </div>

          <button onClick={loadQuiz} className="btn-primary mt-6">Take Quiz Again</button>
        </div>
      ) : (
        <div className="card p-6 mt-6 space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="pb-6 border-b border-bg-border last:border-0 last:pb-0">
              <p className="font-medium mb-3">{idx + 1}. {q.question}</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {['a', 'b', 'c', 'd'].map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm cursor-pointer transition ${
                      answers[q.id] === opt ? 'border-accent-cyan bg-accent-cyan/10' : 'border-bg-border hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      className="accent-cyan-400"
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                    />
                    {q[`option_${opt}`]}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full sm:w-auto">
            {submitting ? 'Grading…' : 'Submit Quiz'}
          </button>
        </div>
      )}

      {attempts.length > 0 && !result && (
        <div className="card p-5 mt-6">
          <h3 className="font-semibold text-sm text-slate-300 mb-3">Your Past Attempts</h3>
          <div className="space-y-2">
            {attempts.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm text-slate-400">
                <span>{new Date(a.created_at).toLocaleDateString()}</span>
                <span>{a.score}/{a.total_questions} ({a.percentage}%)</span>
                <span className="text-accent-purple">{a.performance_level}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
