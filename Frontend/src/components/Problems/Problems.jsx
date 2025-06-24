import { useState, useEffect } from "react";
import axios from "axios"; // Make sure to import axios
import { Link } from "react-router-dom";
import './Problems.css';

function Problems() {
    const [problems, setProblems] = useState([]);

    // ✅ Use useEffect to call the data fetching function when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await axios.get('http://localhost:3000/problems', {
                    withCredentials: true
                });
                setProblems(result.data);
                console.log(result);
            } catch (error) {
                console.error(error);
                alert("Internal Server Error");
            }
        };

        fetchData();
    }, []);

    return (
        <div className="problems">
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
