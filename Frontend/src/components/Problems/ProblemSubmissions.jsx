import { Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function ProblemSubmissions() {
    const { id } = useParams();
    const Navigate = useNavigate();
    const [submissions,setSubmissions] = useState([]);
    useEffect(()=>{
        const fetchData = async function() {
            try {
                const result = axios.get(`http://localhost:3000/submissions/${id}`,{
                    withCredentials : true
                });
                if(!result || !result.data){
                    return <p>Submissions not found</p>
                }
                setSubmissions(result.data);
            } catch (error) {
                alert('Server Error');
            }
        }
        fetchData();
    },[id])
    return (  
        <div className="submissions">
            <table>
                <tr>
                    <th>S.No</th>
                    <th>Language</th>
                    <th>Verdict</th>
                    <th>Runtime</th>
                    <th>Memory</th>
                </tr>
                {submissions.map((index,s)=>{
                    <tr key={s._id}>
                        <td>{index+1}</td>
                        <td>{s.language}</td>
                        <td>{verdict}</td>
                        <td>{s.executionTime}</td>
                        <td>{s.memoryUsed}</td>
                    </tr>
                })}
            </table>
        </div>
    );
}

export default ProblemSubmissions;