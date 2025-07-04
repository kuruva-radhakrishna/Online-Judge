import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './NewProblem.css';

function EditProblem() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [problemName, setProblemName] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [constraints, setConstraints] = useState('');
  const [testCases, setTestCases] = useState([{ input: '', output: '', isPublic: true }]);
  const [difficulty, setDifficulty] = useState('medium');
  const [topics, setTopics] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/problems/${id}`, { withCredentials: true });
        const p = res.data;
        setProblemName(p.problemName || '');
        setProblemDescription(p.problemDescription || '');
        setConstraints((p.Constraints || []).join('\n'));
        setTestCases(p.TestCases && p.TestCases.length > 0 ? p.TestCases : [{ input: '', output: '', isPublic: true }]);
        setDifficulty(p.difficulty || 'medium');
        setTopics((p.topics || []).join(', '));
      } catch (err) {
        setMessage('Failed to fetch problem.');
      }
      setFetching(false);
    };
    fetchProblem();
  }, [id]);

  if (loading || fetching) return <div>Loading...</div>;
  if (!user || user.role !== 'admin') return <div>You are not authorized to edit problems.</div>;

  const handleTestCaseChange = (idx, field, value) => {
    setTestCases(tc => tc.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };
  const addTestCase = () => setTestCases(tc => [...tc, { input: '', output: '', isPublic: true }]);
  const removeTestCase = idx => setTestCases(tc => tc.filter((_, i) => i !== idx));

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await axios.patch(`http://localhost:3000/admin/problems/${id}/update`, {
        problem: {
          problemName,
          problemDescription,
          Constraints: constraints.split('\n').map(s => s.trim()).filter(Boolean),
          TestCases: testCases,
          difficulty,
          topics: topics.split(',').map(t => t.trim()).filter(Boolean)
        }
      }, { withCredentials: true });
      setMessage('Problem updated successfully!');
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      setMessage('Error updating problem.');
    }
    setSubmitting(false);
  };

  return (
    <div className="new-problem-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Edit Problem</h2>
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
        <div className="preview-box">
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
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} required>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="difficult">Difficult</option>
          </select>
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
              {testCases.length > 1 && <button type="button" onClick={() => removeTestCase(idx)}>Remove</button>}
            </div>
          ))}
          <button type="button" className="add-test-case-btn" onClick={addTestCase}>Add Test Case</button>
        </div>
        <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</button>
      </form>
      {message && <div className="message" style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</div>}
    </div>
  );
}

export default EditProblem; 