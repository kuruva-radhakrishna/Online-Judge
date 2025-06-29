import { Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import ProblemDescription from "./ProblemDescription";
import ProblemSubmissions from "./ProblemSubmissions";
import { useEffect, useState } from "react";
import axios, { Axios } from "axios";
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
    const [verdicts, setVerdicts] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const Navigate = useNavigate();

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

    const handle_Run = async function () {
        try {
            const result = axios.post("http://localhost:8000/run", {
                language,
                code,
                input
            });
            console.log(result.data);
        } catch (error) {

        }
    }

    // Fetch submissions
    const fetchSubmissions = async () => {
        try {
            const result = await axios.get(`http://localhost:3000/submissions/${id}`, {
                withCredentials: true
            });
            if (result && result.data) {
                setSubmissions(result.data);
            } else {
                setSubmissions([]);
            }
        } catch (error) {
            setSubmissions([]);
        }
    };

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
        fetchSubmissions();
    }, [id, Navigate]);

    if (!problem) {
        return <p>Loading problem...</p>;
    }

    // Dummy run/submit handlers
    const handleRun = async () => {
        try {
            const result = await axios.post("http://localhost:8000/run", {
                language,
                code,
                input
            }, { withCredentials: true });
            console.log(result.data);
            if (result.data.output) {
                setOutput(result.data.output.output);
            }
            if (result.data.errorType) {
                setOutput(result.data.errorType);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const handleSubmit = async () => {
        try {
            const result = await axios.post(`http://localhost:3000/submissions/${id}`,
                {
                    problem_id: id,
                    language,
                    code,
                },
                { withCredentials: true }
            );

            console.log(result);
            setVerdicts(result.data);
            fetchSubmissions();
        } catch (error) {

        }
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
                        <Route path="submissions" element={<ProblemSubmissions submissions={submissions} refreshSubmissions={fetchSubmissions} />} />
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
                    <CodeEditor value={code} onChange={setCode} language={language} />
                    <InputOutputConsole inputValue={input} onInputChange={e => setInput(e.target.value)} outputValue={output} isOutput={true} />
                    <Box display="flex" gap={2} mt={2}>
                        <button onClick={handleRun}>Run</button>
                        <button onClick={handleSubmit}>Submit</button>
                    </Box>
                    <Verdict verdicts={verdicts} />
                </div>
            </div>
        </div>
    );
}

export default Problem;
