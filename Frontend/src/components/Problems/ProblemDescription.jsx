import { Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import ProblemSubmissions from "./ProblemSubmissions"; // create this component
import { useEffect, useState } from "react";
import axios from "axios";
import './ProblemDescription.css';

function ProblemDescription() {
    const { id } = useParams();
    const [problem, setProblem] = useState();
    const Navigate = useNavigate();

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
            <p>{problem.problemDescription}</p>
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

            <h2>Hints</h2>
            <ul>
                {problem.hints.map((h)=>{
                    return <li>{h}</li>
                })}
            </ul>
        </div>
    );
}

export default ProblemDescription;