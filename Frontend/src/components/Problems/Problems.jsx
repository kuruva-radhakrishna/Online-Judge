import { useState, useEffect } from "react";
import axios from "axios"; // Make sure to import axios
import { Link } from "react-router-dom";
import './Problems.css';
import { useAuth } from "../../contexts/AuthContext";

const DIFFICULTY_ORDER = { easy: 1, medium: 2, difficult: 3 };

function Problems() {
    const [problems, setProblems] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(true);
    const [sortDir, setSortDir] = useState(null); // null, 'asc', 'desc'
    const [submissions, setSubmissions] = useState([]);
    const { user } = useAuth();
    const [solvedSet, setSolvedSet] = useState(new Set());

    // ✅ Use useEffect to call the data fetching function when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError("");
            setSuccess("");
            try {
                const result = await axios.get('http://localhost:3000/problems', {
                    withCredentials: true
                });
                if (!result || !result.data || result.data.length === 0) {
                    setError("Problems not found.");
                    setProblems([]);
                } else {
                    setProblems(result.data);
                    setSuccess("Problems loaded successfully!");
                }
            } catch (error) {
                setError("Loading issues. Please try again later.");
                setProblems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!user) return;
            try {
                const res = await axios.get('http://localhost:3000/submissions/', { withCredentials: true });
                setSubmissions(res.data || []);
            } catch (err) {
                setSubmissions([]);
            }
        };
        fetchSubmissions();
    }, [user]);

    useEffect(() => {
        const set = new Set();
        (submissions || []).forEach(sub => {
            const pid = typeof sub.problem_id === 'object' ? sub.problem_id._id : sub.problem_id;
            if (sub.verdict === 'Accepted' && pid) set.add(pid.toString());
        });
        setSolvedSet(set);
    }, [submissions]);

    // Sorting logic
    const sortedProblems = [...problems];
    if (sortDir) {
        sortedProblems.sort((a, b) => {
            const aVal = DIFFICULTY_ORDER[a.difficulty?.toLowerCase()] || 99;
            const bVal = DIFFICULTY_ORDER[b.difficulty?.toLowerCase()] || 99;
            return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        });
    }

    const handleSortClick = () => {
        setSortDir(dir => dir === 'asc' ? 'desc' : dir === 'desc' ? null : 'asc');
    };

    return (
        <div className="problems">
            {loading && <p style={{ color: 'blue', textAlign: 'center' }}>Loading problems...</p>}
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            {success && !loading && !error && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}
            <table>
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Problem Name</th>
                        <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={handleSortClick}>
                            Difficulty
                            <span style={{ marginLeft: 6, fontSize: '1.1em' }}>
                                {sortDir === 'asc' ? '▲' : sortDir === 'desc' ? '▼' : '↕'}
                            </span>
                        </th>
                        <th>Topics</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedProblems.map((p, index) => {
                        const isSolved = solvedSet.has(p._id?.toString());
                        return (
                            <tr key={index} className={isSolved ? 'solved-problem-row' : ''}>
                                <td>{index + 1}</td>
                                <td>
                                    <div className="problem-name-cell">
                                        <Link to={`/problem/${p._id}/description`} className={isSolved ? 'solved-problem-link' : ''}>{p.problemName}</Link>
                                        {isSolved && <span title="Solved" className="solved-tick">✔️</span>}
                                    </div>
                                </td>
                                <td>
                                    <span className={`difficulty-box ${p.difficulty?.toLowerCase()}`}>{p.difficulty}</span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {Array.isArray(p.topics)
                                            ? p.topics.map((topic, i) => (
                                                <span key={i} className="topic-tag">{topic}</span>
                                            ))
                                            : p.topics && <span className="topic-tag">{p.topics}</span>}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default Problems;
