import { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../contexts/AuthContext';
import './NewProblem.css';

function NewProblem() {
  const { user, loading } = useAuth();
  const [problemName, setProblemName] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [constraints, setConstraints] = useState('');
  const [testCases, setTestCases] = useState([{ input: '', output: '', isPublic: true }]);
  const [difficulty, setDifficulty] = useState('medium');
  const [topics, setTopics] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user || user.role !== 'admin') {
    return <div>You are not authorized to create problems.</div>;
  }

  const handleTestCaseChange = (idx, field, value) => {
    setTestCases(tc => tc.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };
  const addTestCase = () => setTestCases(tc => [...tc, { input: '', output: '', isPublic: true }]);
  const removeTestCase = idx => setTestCases(tc => tc.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const res = await axios.post('http://localhost:3000/admin/problems/new', {
        problem: {
          problemName,
          problemDescription,
          Constraints: constraints.split('\n').map(s => s.trim()).filter(Boolean),
          TestCases: testCases,
          difficulty,
          topics: topics.split(',').map(t => t.trim()).filter(Boolean)
        }
      }, { withCredentials: true });
      setMessage('Problem created successfully!');
      setProblemName(''); setProblemDescription(''); setConstraints(''); setTestCases([{ input: '', output: '', isPublic: true }]); setDifficulty('medium'); setTopics('');
    } catch (err) {
      setMessage('Error creating problem.');
    }
    setSubmitting(false);
  };

  const handleAI = async () => {
    setMessage('');
    setAiLoading(true);
    try {
      const result = await axios.post('http://localhost:3000/ai/createProblem', {
        problem: {
          problemName,
          problemDescription,
          Constraints: constraints.split('\n').map(s => s.trim()).filter(Boolean),
          TestCases: testCases,
          difficulty,
          topics: topics.split(',').map(t => t.trim()).filter(Boolean)
        }
      }, { withCredentials: true });

      const prob = result.data.problem;
      if (prob) {
        setProblemName(prob.problemName || problemName);
        setProblemDescription(prob.problemDescription || problemDescription);
        setConstraints((prob.Constraints || []).join('\n'));
        setTopics((prob.topics || []).join(', '));
        setDifficulty(prob.difficulty || difficulty);
        if (prob.TestCases && Array.isArray(prob.TestCases)) {
          setTestCases(prob.TestCases);
        }
        setMessage('AI completed the problem!');
      } else {
        setMessage('AI did not return a valid problem.');
        console.error('AI response missing problem object:', result.data);
      }
    } catch (error) {
      setMessage('AI completion failed.');
      console.error('AI completion error:', error);
    }
    setAiLoading(false);
  };

  return (
    <div className="new-problem-container" style={{ maxWidth: 700, margin: '60px auto', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Create New Problem</h2>
        <button
          onClick={handleAI}
          disabled={aiLoading}
          style={{
            background: aiLoading ? '#e0e0e0' : '#1976d2',
            color: aiLoading ? '#888' : '#fff',
            border: 'none',
            borderRadius: 7,
            padding: '8px 18px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: aiLoading ? 'not-allowed' : 'pointer',
            transition: 'background 0.18s, color 0.18s',
            minWidth: 120
          }}
        >
          {aiLoading ? 'Completing...' : 'AI completion'}
        </button>
      </div>
      {message && (
        <div style={{
          marginBottom: 16,
          color: message.includes('completed') ? 'green' : 'red',
          fontWeight: 600,
          fontSize: '1.1rem',
          minHeight: 24
        }}>{message}</div>
      )}
      <form onSubmit={handleSubmit} className="new-problem-form" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label>Problem Name
          <input type="text" value={problemName} onChange={e => setProblemName(e.target.value)} required />
        </label>
        <label>Description (Markdown supported)
          <textarea value={problemDescription} onChange={e => setProblemDescription(e.target.value)} rows={6} required />
        </label>
        <div style={{ background: '#f5f7fa', padding: 12, borderRadius: 6, marginBottom: 8 }}>
          <b>Preview:</b>
          <ReactMarkdown>{problemDescription}</ReactMarkdown>
        </div>
        <label>Constraints (one per line)
          <textarea value={constraints} onChange={e => setConstraints(e.target.value)} rows={2} required />
        </label>
        <label>Topics (comma separated)
          <input type="text" value={topics} onChange={e => setTopics(e.target.value)} />
        </label>
        <label>Difficulty
          <div className="difficulty-pill-group">
            {['easy', 'medium', 'difficult'].map((level) => (
              <button
                type="button"
                key={level}
                className={`difficulty-pill${difficulty === level ? ' selected' : ''}${level !== 'easy' ? ' ' + level : ''}`}
                onClick={() => setDifficulty(level)}
                aria-pressed={difficulty === level}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </label>
        <div>
          <b>Test Cases</b>
          {testCases.map((tc, idx) => (
            <div key={idx} className="test-case-block">
              <label>Input
                <textarea value={tc.input} onChange={e => handleTestCaseChange(idx, 'input', e.target.value)} rows={2} required />
              </label>
              <label>Output
                <textarea value={tc.output} onChange={e => handleTestCaseChange(idx, 'output', e.target.value)} rows={2} required />
              </label>
              <label>Is Public?
                <input type="checkbox" checked={tc.isPublic} onChange={e => handleTestCaseChange(idx, 'isPublic', e.target.checked)} />
              </label>
              {testCases.length > 1 && <button type="button" className="remove-btn" onClick={() => removeTestCase(idx)}>Remove</button>}
            </div>
          ))}
          <button type="button" className="add-test-case-btn" onClick={addTestCase}>Add Test Case</button>
        </div>
        <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Create Problem'}</button>
      </form>
    </div>
  );
}

export default NewProblem; 