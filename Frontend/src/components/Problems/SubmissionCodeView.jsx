import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import './ProblemSubmissions.css';

function SubmissionCodeView() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:3000/submissions/single/${id}`, { withCredentials: true });
        setSubmission(res.data);
        setError(null);
      } catch (err) {
        setError('Could not fetch submission.');
        setSubmission(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [id]);

  if (loading) return <div className="problem-submissions"><p>Loading...</p></div>;
  if (error) return <div className="problem-submissions"><p style={{color: 'red'}}>{error}</p></div>;
  if (!submission) return <div className="problem-submissions"><p>No submission found.</p></div>;

  return (
    <div className="problem-submissions" style={{maxWidth: 700, margin: '32px auto'}}>
      <h2 style={{marginBottom: 12}}>Submission Details</h2>
      <div style={{marginBottom: 16}}>
        <b>Language:</b> {submission.language} <br/>
        <b>Verdict:</b> {submission.verdict} <br/>
        <b>Submitted At:</b> {new Date(submission.submittedAt).toLocaleString()} <br/>
      </div>
      <div>
        <b>Code:</b>
        <pre style={{
          background: '#f5f7fa',
          borderRadius: 8,
          padding: 16,
          fontFamily: 'Fira Mono, Consolas, monospace',
          fontSize: '1rem',
          overflowX: 'auto',
          marginTop: 8,
          marginBottom: 16
        }}>{submission.code}</pre>
      </div>
      <Link to={-1} className="view-code-link">Back</Link>
    </div>
  );
}

export default SubmissionCodeView; 