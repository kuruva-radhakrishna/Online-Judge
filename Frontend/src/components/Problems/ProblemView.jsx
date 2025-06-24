import { Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import ProblemDescription from "./ProblemDescription";
import ProblemSubmissions from "./ProblemSubmissions";
import { useEffect, useState } from "react";
import axios from "axios";
import './ProblemView.css';
import CodeEditor from './CodeEditor';
import InputOutputConsole from './InputOutputConsole';
import Verdict from './Verdict';
import Box from '@mui/material/Box';

function Problem() {
    const { id } = useParams();
    const [problem, setProblem] = useState();
    const [language, setLanguage] = useState('cpp');
    const [code, setCode] = useState('');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [verdict, setVerdict] = useState('');
    const Navigate = useNavigate();

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const result = await axios.get(`http://localhost:3000/problems/${id}`, {
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
    }, [id, Navigate]);

    if (!problem) {
        return <p>Loading problem...</p>;
    }

    // Dummy run/submit handlers
    const handleRun = () => {
        setOutput('Sample output...');
        setVerdict('Accepted');
    };
    const handleSubmit = () => {
        setOutput('Sample output...');
        setVerdict('Wrong Answer');
    };

    return (
        <div className="problem-view">
            <div className="row" style={{ display: "flex" }}>
                <div className="problem" style={{ width: "50%" }}>
                    <div style={{ marginBottom: "1rem" }}>
                        <Link to={`/problem/${id}/description`}><button>Description</button></Link>
                        <Link to={`/problem/${id}/submissions`}><button>Submissions</button></Link>
                    </div>
                    <Routes>
                        <Route path="description" element={<ProblemDescription />} />
                        <Route path="submissions" element={<ProblemSubmissions />} />
                    </Routes>
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
                    <CodeEditor value={code} onChange={e => setCode(e.target.value)} language={language} />
                    <InputOutputConsole inputValue={input} onInputChange={e => setInput(e.target.value)} outputValue={output} isOutput={true} />
                    <Box display="flex" gap={2} mt={2}>
                        <button onClick={handleRun}>Run</button>
                        <button onClick={handleSubmit}>Submit</button>
                    </Box>
                    <Verdict verdict={verdict} />
                </div>
            </div>
        </div>
    );
}

export default Problem;
