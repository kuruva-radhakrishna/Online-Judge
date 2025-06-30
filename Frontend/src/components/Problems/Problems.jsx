import { useState, useEffect } from "react";
import axios from "axios"; // Make sure to import axios
import { Link } from "react-router-dom";
import './Problems.css';

function Problems() {
    const [problems, setProblems] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(true);

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
                        <th>Difficulty</th>
                        <th>Topics</th>
                    </tr>
                </thead>
                <tbody>
                    {problems.map((p, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td><Link to={`/problem/${p._id}/description`}>{p.problemName}</Link></td>
                            <td>{p.difficulty}</td>
                            <td>
                                {Array.isArray(p.topics) ? p.topics.join(", ") : p.topics}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Problems;
