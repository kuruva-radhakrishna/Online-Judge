import { Routes, Route, Link, useParams, useNavigate, useLocation } from "react-router-dom";
import ProblemDescription from "./ProblemDescription";
import ProblemSubmissions from "./ProblemSubmissions";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import './ProblemView.css';
import CodeEditor from './CodeEditor';
import InputOutputConsole from './InputOutputConsole';
import Verdict from './Verdict';
import Box from '@mui/material/Box';
import ReactMarkdown from 'react-markdown';
import ProblemDiscussion from "./ProblemDiscussion";
import CircularProgress from '@mui/material/CircularProgress';

function Problem(props) {
    // Support contestId from props, route params, or location state
    const params = useParams();
    const location = useLocation();
    const contestId = props.contestId || params.contestId || (location.state && location.state.contestId);
    const problemId = props.problemId || params.problemId || params.id;
    const [problem, setProblem] = useState();
    const [language, setLanguage] = useState('cpp');
    const [code, setCode] = useState('');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [verdicts, setVerdicts] = useState([]);
    const [failedCase, setFailedCase] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [review, setReview] = useState('');
    const [aiReviewClicked, setAIReviewClicked] = useState(false);
    const [debugResult, setDebugResult] = useState('');
    const [debugLoading, setDebugLoading] = useState(false);
    const [contest, setContest] = useState(null);
    const [contestStatus, setContestStatus] = useState(null); // 'future', 'ongoing', 'past', null
    const [now, setNow] = useState(new Date());
    const Navigate = useNavigate();
    const [timerString, setTimerString] = useState("");
    const [tab, setTab] = useState('description');
    const [runLoading, setRunLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [showFailedCase, setShowFailedCase] = useState(true);

    // Fetch contest if contestId is present
    useEffect(() => {
        if (!contestId) return;
        async function fetchContest() {
            try {
                const res = await axios.get(`http://localhost:3000/contests/${contestId}`, { withCredentials: true });
                setContest(res.data);
                console.log(res.data);
                const start = new Date(res.data.startTime);
                const end = new Date(res.data.endTime);
                const isOngoing = now >= start && now < end;
                // Check if this problem is part of the contest
                const isInContest = res.data.problems.some(
                    (p) => (p.problem_id._id || p.problem_id) === problemId
                );
                if (isOngoing && isInContest) setContestStatus("ongoing");
                else if (now < start && isInContest) setContestStatus("future");
                else if (now >= end && isInContest) setContestStatus("past");
                else setContestStatus(null); // Not in contest
            } catch (err) {
                setContestStatus(null);
            }
        }
        fetchContest();
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, [contestId, now, problemId]);

    useEffect(() => {
        switch (language) {
            case "c++":
                setCode(`#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}`);
                break;
            case "python":
                setCode(`def main():\n    # your code here\n    pass\n\nif __name__ == "__main__":\n    main()`);
                break;
            case "java":
                setCode(`public class Main {\n    public static void main(String[] args) {\n        // your code here\n    }\n}`);
                break;
            default:
                setCode(`#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}`);
        }
    }, [language]);

    // Fetch submissions
    const fetchSubmissions = async () => {
        try {
            const result = await axios.get(`http://localhost:3000/submissions/${problemId}`, {
                withCredentials: true
            });
            if (result && result.data) {
                let filtered = result.data;
                if (contestId && contestStatus === "ongoing") {
                    filtered = filtered.filter(
                        (sub) => sub.contest_id && sub.contest_id === contestId
                    );
                }
                setSubmissions(filtered);
            } else {
                setSubmissions([]);
            }
        } catch (error) {
            setSubmissions([]);
        }
    };

    // Fetch problem
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const result = await axios.get(`http://localhost:3000/problems/${problemId}`, {
                    withCredentials: true,
                });
                if (!result.data) {
                    alert("Selected problem has been deleted.");
                    Navigate("/problems");
                } else {
                    setProblem(result.data);
                }
            } catch (err) {
                alert("Problem fetch error.");
                Navigate("/problems");
            }
        };
        fetchProblem();
        fetchSubmissions();
    }, [problemId, Navigate]);

    useEffect(() => {
        if (contestStatus === "ongoing" && contest && contest.endTime) {
            const updateTimer = () => {
                const diff = new Date(contest.endTime) - new Date();
                if (diff <= 0) setTimerString("00:00:00");
                else {
                    const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
                    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
                    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
                    setTimerString(`${h}:${m}:${s}`);
                }
            };
            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        }
    }, [contestStatus, contest]);

    if (!problem) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}><CircularProgress size={60} thickness={5} /></div>;
    }

    // Handlers
    const handleRun = async () => {
        setRunLoading(true);
        try {
            const result = await axios.post("http://localhost:8000/run", {
                language,
                code,
                input
            }, { withCredentials: true });
            if (result.data.output) {
                setOutput(result.data.output.output);
            }
            if (result.data.errorType) {
                setOutput(result.data.errorType);
            }
        } catch (error) {
            setOutput('Run failed.');
        }
        setRunLoading(false);
    };
    const handleSubmit = async () => {
        setSubmitLoading(true);
        try {
            let url, payload;
            if (contestId && contestStatus === "ongoing") {
                url = `http://localhost:3000/contests/submission/${contestId}/${problemId}`;
                payload = {
                    submission: {
                        language,
                        code,
                    }
                };
            } else {
                url = `http://localhost:3000/submissions/${problemId}`;
                payload = {
                    problem_id: problemId,
                    language,
                    code,
                };
            }
            const result = await axios.post(url, payload, { withCredentials: true });
            setVerdicts(result.data.verdicts);
            console.log('verdicts:', result.data);
            setFailedCase(result.data.failedCase || null);
            setShowFailedCase(true);
            fetchSubmissions();
        } catch (error) {
            setVerdicts([{ status: 'Submission failed.' }]);
            setFailedCase(null);
        }
        setSubmitLoading(false);
    };
    const handleAIReview = async () => {
        setAIReviewClicked(true);
        try {
            const result = await axios.post('http://localhost:3000/ai/review',
                { code }, { withCredentials: true }
            );
            setReview(result.data.review);
            setAIReviewClicked(false);
        } catch (error) {
            setReview('AI review failed.');
            setAIReviewClicked(false);
        }
    }
    const handleAIDebug = async () => {
        setDebugLoading(true);
        setDebugResult('');
        try {
            const result = await axios.post('http://localhost:3000/ai/debug', {
                code,
                problemDescription: problem.problemDescription
            }, { withCredentials: true });
            setDebugResult(result.data.debug);
        } catch (error) {
            setDebugResult('AI debug failed.');
        }
        setDebugLoading(false);
    };

    // Contest logic: if contestId is present
    if (contestId) {
        if (contestStatus === "future") {
            return <div className="problem-view"><h2>Contest has not started yet.</h2></div>;
        }
        if (contestStatus === "notfound") {
            return <div className="problem-view"><h2>Contest not found.</h2></div>;
        }
        // Ongoing: show timer, hide AI buttons, use contest submit route
        if (contestStatus === "ongoing") {
            return (
                <div className="problem-view" style={{ position: 'relative' }}>
                    <div className="contest-timer-topright">
                        <span role="img" aria-label="stopwatch" className="timer-icon">⏱️</span>
                        <span className="timer-value">{timerString}</span>
                        <span className="timer-label">left</span>
                    </div>
                    <div className="row" style={{ display: "flex" }}>
                        <div className="problem" style={{ width: "50%" }}>
                            <div style={{ marginBottom: "1rem" }}>
                                <Link to={`/contests/${contestId}/problem/${problemId}/description`}><button>Description</button></Link>
                                <Link to={`/contests/${contestId}/problem/${problemId}/submissions`}><button>Submissions</button></Link>
                            </div>
                            <Routes>
                                <Route path="description" element={<ProblemDescription />} />
                                <Route path="submissions" element={<ProblemSubmissions submissions={submissions} refreshSubmissions={fetchSubmissions} />} />
                            </Routes>
                        </div>
                        <div className="solution" style={{ width: "50%" }}>
                            <select
                                name="language"
                                value={language}
                                onChange={e => setLanguage(e.target.value)}
                                className="language-select"
                            >
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                                <option value="python">Python</option>
                            </select>
                            <CodeEditor value={code} onChange={setCode} language={language} />
                            <Box display="flex" gap={2} mt={2} justifyContent="space-between">
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <button onClick={handleRun} className="ai-review-btn" disabled={runLoading}>
                                        {runLoading ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <CircularProgress size={18} style={{ color: '#fff' }} />
                                                Running...
                                            </span>
                                        ) : '▶️ Run'}
                                    </button>
                                    <button onClick={handleSubmit} className="submit-btn" disabled={submitLoading}>
                                        {submitLoading ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <CircularProgress size={18} style={{ color: '#fff' }} />
                                                Submitting...
                                            </span>
                                        ) : '📤 Submit'}
                                    </button>
                                </div>
                            </Box>
                            {failedCase && showFailedCase && (
                              <div style={{
                                background: '#f8fafd',
                                border: '1.5px solid #e0e0e0',
                                borderRadius: 10,
                                marginTop: 12,
                                marginBottom: 18,
                                padding: '16px 18px 10px 18px',
                                color: '#222',
                                fontSize: '1.05rem',
                                width: '100%',
                                maxWidth: '100%',
                                position: 'relative',
                                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.07)'
                              }}>
                                <button onClick={() => setShowFailedCase(false)} style={{
                                  position: 'absolute', top: 8, right: 12,
                                  background: '#ffa116', border: '1.5px solid #e57373',
                                  borderRadius: '50%', width: 28, height: 28,
                                  fontSize: 18, color: '#fff', cursor: 'pointer', fontWeight: 700,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                                }} title="Close">×</button>
                                <b>Failed Test Case:</b>
                                <div style={{ marginTop: 8, marginBottom: 6 }}>
                                  <b>Input:</b>
                                  <pre style={{ background: '#f5f7fa', borderRadius: 6, padding: 8, margin: 0, overflowX: 'auto', maxWidth: '100%' }}>{failedCase.input}</pre>
                                </div>
                                <div style={{ marginBottom: 6 }}>
                                  <b>Expected Output:</b>
                                  <pre style={{ background: '#f5f7fa', borderRadius: 6, padding: 8, margin: 0, overflowX: 'auto', maxWidth: '100%' }}>{failedCase.expectedOutput || failedCase.expected}</pre>
                                </div>
                                <div>
                                  <b>Your Output:</b>
                                  <pre style={{ background: '#f5f7fa', borderRadius: 6, padding: 8, margin: 0, overflowX: 'auto', maxWidth: '100%' }}>{failedCase.actualOutput || failedCase.actual}</pre>
                                </div>
                              </div>
                            )}
                            <InputOutputConsole inputValue={input} onInputChange={e => setInput(e.target.value)} outputValue={output} isOutput={true} />
                            <Verdict verdicts={verdicts} />
                        </div>
                    </div>
                </div>
            );
        }
        // Past: show normal problem view (with AI buttons)
        if (contestStatus === "past") {
            // fall through to normal rendering below
        }
    }

    // Normal or contest past view
    return (
        <div className="problem-view">
            <div className="row" style={{ display: "flex" }}>
                <div className="problem" style={{ width: "50%" }}>
                    <div style={{ marginBottom: "1rem", display: 'flex', gap: 8 }}>
                        <button onClick={() => setTab('description')} className={tab === 'description' ? 'active-tab' : ''}>Description</button>
                        <button onClick={() => setTab('submissions')} className={tab === 'submissions' ? 'active-tab' : ''}>Submissions</button>
                        <button onClick={() => setTab('discussions')} className={tab === 'discussions' ? 'active-tab' : ''}>Discussions</button>
                    </div>
                    {tab === 'description' && <ProblemDescription />}
                    {tab === 'submissions' && <ProblemSubmissions submissions={submissions} refreshSubmissions={fetchSubmissions} />}
                    {tab === 'discussions' && <ProblemDiscussion problemId={problemId} />}
                </div>
                {/* Right section: Code editor and controls */}
                <div className="solution" style={{ width: "50%" }}>
                    <select
                        name="language"
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                        className="language-select"
                    >
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                        <option value="python">Python</option>
                    </select>
                    <CodeEditor value={code} onChange={setCode} language={language} />
                    <Box display="flex" gap={2} mt={2} justifyContent="space-between">
                        <div style={{ display: 'flex', gap: 16 }}>
                            <button onClick={handleRun} className="ai-review-btn" disabled={runLoading}>
                                {runLoading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <CircularProgress size={18} style={{ color: '#fff' }} />
                                        Running...
                                    </span>
                                ) : '▶️ Run'}
                            </button>
                            <button onClick={handleSubmit} className="submit-btn" disabled={submitLoading}>
                                {submitLoading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <CircularProgress size={18} style={{ color: '#fff' }} />
                                        Submitting...
                                    </span>
                                ) : '📤 Submit'}
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <button onClick={handleAIReview} disabled={aiReviewClicked} className="ai-review-btn">📝 AI Review</button>
                            <button onClick={handleAIDebug} disabled={debugLoading} className="ai-debug-btn">🐞 {debugLoading ? 'Debugging...' : 'AI Debug'}</button>
                        </div>
                    </Box>
                    {failedCase && showFailedCase && (
                      <div style={{
                        background: '#f8fafd',
                        border: '1.5px solid #e0e0e0',
                        borderRadius: 10,
                        marginTop: 12,
                        marginBottom: 18,
                        padding: '16px 18px 10px 18px',
                        color: '#222',
                        fontSize: '1.05rem',
                        width: '100%',
                        maxWidth: '100%',
                        position: 'relative',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.07)'
                      }}>
                        <button onClick={() => setShowFailedCase(false)} style={{
                          position: 'absolute', top: 8, right: 12,
                          background: '#ffa116', border: '1.5px solid #e57373',
                          borderRadius: '50%', width: 28, height: 28,
                          fontSize: 18, color: '#fff', cursor: 'pointer', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                        }} title="Close">×</button>
                        <b>Failed Test Case:</b>
                        <div style={{ marginTop: 8, marginBottom: 6 }}>
                          <b>Input:</b>
                          <pre style={{ background: '#f5f7fa', borderRadius: 6, padding: 8, margin: 0, overflowX: 'auto', maxWidth: '100%' }}>{failedCase.input}</pre>
                        </div>
                        <div style={{ marginBottom: 6 }}>
                          <b>Expected Output:</b>
                          <pre style={{ background: '#f5f7fa', borderRadius: 6, padding: 8, margin: 0, overflowX: 'auto', maxWidth: '100%' }}>{failedCase.expectedOutput || failedCase.expected}</pre>
                        </div>
                        <div>
                          <b>Your Output:</b>
                          <pre style={{ background: '#f5f7fa', borderRadius: 6, padding: 8, margin: 0, overflowX: 'auto', maxWidth: '100%' }}>{failedCase.actualOutput || failedCase.actual}</pre>
                        </div>
                      </div>
                    )}
                    {review && (
                        <div className="ai-review-container">
                            <div className="ai-section-header">📝 <span>AI Review</span></div>
                            <div className="ai-review-content"><ReactMarkdown>{review}</ReactMarkdown></div>
                        </div>
                    )}
                    {debugResult && (
                        <div className="ai-debug-container" style={{ marginTop: 20 }}>
                            <div className="ai-section-header">🐞 <span>AI Debug</span></div>
                            <div className="ai-debug-content"><ReactMarkdown>{debugResult}</ReactMarkdown></div>
                        </div>
                    )}
                    <InputOutputConsole inputValue={input} onInputChange={e => setInput(e.target.value)} outputValue={output} isOutput={true} />
                    <Verdict verdicts={verdicts} />
                </div>
            </div>
        </div>
    );
}

export default Problem;
