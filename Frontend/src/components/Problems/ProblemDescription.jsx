import { Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import ProblemSubmissions from "./ProblemSubmissions"; // create this component
import { useEffect, useState } from "react";
import axios from "axios";
import './ProblemDescription.css';
import ReactMarkdown from 'react-markdown';

function ProblemDescription() {
    const { id } = useParams();
    const [problem, setProblem] = useState();
    const Navigate = useNavigate();
    const [showHints, setShowHints] = useState(false);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const result = await axios.get(`http://localhost:3000/problems/${id}`, {
                    withCredentials: true,
                });
                console.log(result);
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

    return ( 
        <div className="problem-description">
            <h1>{problem.problemName}</h1>
            <br /><br />
            <ReactMarkdown>{problem.problemDescription}</ReactMarkdown>
            <h2>Constrains</h2>
            <ul>
                {problem.Constraints.map((c)=>{
                    return <li>{c}</li>
                })}
            </ul>

            <h2>Sample Input</h2>
            <p>{problem.TestCases[0].input}</p>
            <h2>Sample Output</h2>
            <p>{problem.TestCases[0].output}</p>

            {problem.hints && problem.hints.length > 0 && (
                <div style={{ marginTop: 24 }}>
                    <button
                        onClick={() => setShowHints(h => !h)}
                        style={{
                            background: showHints ? '#ffa116' : '#1976d2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 7,
                            padding: '8px 18px',
                            fontWeight: 600,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            marginBottom: 12
                        }}
                    >
                        {showHints ? 'Hide Hints' : 'View Hints'}
                    </button>
                    {showHints && (
                        <div>
                            <h2>Hints</h2>
                            <ul>
                                {problem.hints.map((h, i) => (
                                    <li key={i}>{h}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ProblemDescription;