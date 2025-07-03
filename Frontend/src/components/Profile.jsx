import { useEffect, useState } from "react";
import axios from 'axios';
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Divider } from '@mui/material';
import { Link } from 'react-router-dom';

function formatFormalDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    let hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, '0');
    const ampm = hour >= 12 ? 'pm' : 'am';
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    return `${day} ${month} ${year} at ${hour}:${minute} ${ampm}`;
}

function Profile() {
    const [problems, setProblems] = useState([]);
    const [submissionsByUser, setSubmissionsByUser] = useState([]);
    const { user } = useAuth();
    const [solved, setSolved] = useState([0, 0, 0]);
    const [total, setTotal] = useState([0, 0, 0]);
    const [deleteMsg, setDeleteMsg] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                let result;
                if (user && user.role === 'admin') {
                    result = await axios.get('http://localhost:3000/admin/problems/', { withCredentials: true });
                } else {
                    result = await axios.get('http://localhost:3000/problems', { withCredentials: true });
                }
                const submissions = await axios.get('http://localhost:3000/submissions/', { withCredentials: true });
                setProblems(result.data || []);
                setSubmissionsByUser(submissions.data || []);
            } catch (error) {
                // handle error
            }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        // Build solved set
        const solvedSet = new Set();
        (submissionsByUser || []).forEach(sub => {
            const pid = typeof sub.problem_id === 'object' ? sub.problem_id._id : sub.problem_id;
            if (sub.verdict === 'Accepted' && pid) {
                solvedSet.add(pid.toString());
            }
        });
        // Count per difficulty
        let t = [0, 0, 0];
        let s = [0, 0, 0];
        (problems || []).forEach(prob => {
            let idx = prob.difficulty === 'easy' ? 0 : prob.difficulty === 'medium' ? 1 : 2;
            t[idx]++;
            if (solvedSet.has(prob._id.toString())) s[idx]++;
        });
        setTotal(t);
        setSolved(s);
    }, [problems, submissionsByUser]);

    const handleDeleteProblem = async (problemId) => {
        if (!window.confirm("Are you sure you want to delete this problem? This will also delete all submissions for this problem.")) return;
        try {
            const result = await axios.delete(`http://localhost:3000/admin/problems/${problemId}`, { withCredentials: true });
            console.log(result);
            setProblems(problems.filter(p => p._id !== problemId));
            setDeleteMsg("Problem deleted successfully.");
            setTimeout(() => setDeleteMsg(""), 2000);
        } catch (err) {
            setDeleteMsg("Failed to delete problem.");
            setTimeout(() => setDeleteMsg(""), 2000);
        }
    };

    if (!user) {
        return <div>Loading profile...</div>;
    }

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, p: 2 }}>
            <Card sx={{ mb: 4, p: 2, display: 'flex', alignItems: 'center', gap: 3, boxShadow: 3 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: '#ffa116', fontSize: 36 }}>
                    {user.firstname?.[0]?.toUpperCase()}{user.lastname?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                    <Typography variant="h4" fontWeight={700}>{user.firstname} {user.lastname}</Typography>
                    <Typography variant="subtitle1" color="text.secondary">{user.email}</Typography>
                </Box>
            </Card>
            <Card sx={{ mb: 4, p: 2, boxShadow: 2 }}>
                <Typography variant="h6" fontWeight={600} mb={2}>Solved Problems</Typography>
                <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                    <Box textAlign="center">
                        <Typography variant="subtitle2" color="#388e3c">Easy</Typography>
                        <Typography variant="h5" fontWeight={700}>{solved[0]}/{total[0]}</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box textAlign="center">
                        <Typography variant="subtitle2" color="#fbc02d">Medium</Typography>
                        <Typography variant="h5" fontWeight={700}>{solved[1]}/{total[1]}</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box textAlign="center">
                        <Typography variant="subtitle2" color="#d32f2f">Hard</Typography>
                        <Typography variant="h5" fontWeight={700}>{solved[2]}/{total[2]}</Typography>
                    </Box>
                </Box>
            </Card>
            {user && user.role === 'admin' && (
                <>
                <Card sx={{ p: 2, boxShadow: 1, mb: 4 }}>
                    <Typography variant="h6" fontWeight={600} mb={2}>Problems You Created</Typography>
                    <TableContainer component={Paper} sx={{ mb: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>S.No</TableCell>
                                    <TableCell>Problem Name</TableCell>
                                    <TableCell>Created At</TableCell>
                                    <TableCell>Edit</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {problems && problems.length > 0 ? (
                                    problems.map((problem, idx) => (
                                        <TableRow key={problem._id}>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell>{problem.problemName}</TableCell>
                                            <TableCell>{formatFormalDate(problem.CreatedAt)}</TableCell>
                                            <TableCell>
                                                <Link to={`/problems/${problem._id}/edit`} style={{ color: '#1976d2', marginRight: 12 }}>Edit</Link>
                                                <button onClick={() => handleDeleteProblem(problem._id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">No problems created.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
                </>
            )}
            {deleteMsg && <div style={{ color: deleteMsg.includes('success') ? 'green' : 'red', marginBottom: 8 }}>{deleteMsg}</div>}
            <Card sx={{ p: 2, boxShadow: 1 }}>
                <Typography variant="h6" fontWeight={600} mb={2}>Your Submissions</Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>S.No</TableCell>
                                <TableCell>Problem Name</TableCell>
                                <TableCell>Language</TableCell>
                                <TableCell>Verdict</TableCell>
                                <TableCell>Submitted At</TableCell>
                                <TableCell>View</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {submissionsByUser && submissionsByUser.length > 0 ? (
                                submissionsByUser.map((submission, index) => (
                                    <TableRow key={submission._id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <Link to={`/problem/${submission.problem_id._id || submission.problem_id}/description`} style={{ textDecoration: 'none', color: '#1976d2' }}>
                                                {submission.problem_id.problemName || submission.problem_id}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{submission.language}</TableCell>
                                        <TableCell>{submission.verdict}</TableCell>
                                        <TableCell>{formatFormalDate(submission.submittedAt)}</TableCell>
                                        <TableCell>
                                            <Link to={`/submission/${submission._id}`} className="view-code-link" style={{ color: '#ffffff', fontWeight: 600 }}>View Code</Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No submissions found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
}

export default Profile;