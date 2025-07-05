import { useEffect, useState } from "react";
import axios from 'axios';
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Divider, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import './Profile.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';

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
    const [problemsByUser,setProblemsByUser] = useState([]);
    const [submissionsByUser, setSubmissionsByUser] = useState([]);
    const { user } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [solved, setSolved] = useState([0, 0, 0]);
    const [total, setTotal] = useState([0, 0, 0]);
    const [deleteMsg, setDeleteMsg] = useState("");
    const [createdContests, setCreatedContests] = useState([]);
    const [attendedContests, setAttendedContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user && user.role === 'admin') {
                    const res = await axios.get('http://localhost:3000/admin/problems/', { withCredentials: true });
                    setProblemsByUser(res.data);
                } 
                const result = await axios.get('http://localhost:3000/problems', { withCredentials: true });
                const submissions = await axios.get('http://localhost:3000/submissions/', { withCredentials: true });
                setProblems(result.data || []);
                setSubmissionsByUser(submissions.data || []);
                // Fetch contests created by user
                const createdContestsRes = await axios.get('http://localhost:3000/admin/contests/created-by-me', { withCredentials: true });
                setCreatedContests(createdContestsRes.data || []);
                // Fetch all contests and search leaderboards for the current user
                const contestsRes = await axios.get('http://localhost:3000/contests', { withCredentials: true });
                const allContests = contestsRes.data || [];
                const attended = [];
                allContests.forEach(contest => {
                    if (contest.leaderBoard && Array.isArray(contest.leaderBoard)) {
                        // Sort leaderboard by points desc, then lastSubmission asc
                        const sorted = [...contest.leaderBoard].sort((a, b) => {
                            if (b.points !== a.points) return b.points - a.points;
                            if (!a.lastSubmission) return 1;
                            if (!b.lastSubmission) return -1;
                            return new Date(a.lastSubmission) - new Date(b.lastSubmission);
                        });
                        const idx = sorted.findIndex(e => e.user_id && (e.user_id._id === user._id || e.user_id === user._id));
                        if (idx !== -1) {
                            const entry = sorted[idx];
                            attended.push({
                                ...contest,
                                userStats: {
                                    rank: idx + 1,
                                    points: entry.points,
                                    solvedProblems: entry.solvedProblems ? entry.solvedProblems.length : 0,
                                }
                            });
                        }
                    }
                });
                setAttendedContests(attended);
            } catch (error) {
                // handle error
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        // Build solved set
        const solvedSet = new Set();
        (submissionsByUser || []).forEach(sub => {
            if (!sub || !sub.problem_id) return; // null check
            const pid = typeof sub.problem_id === 'object' ? sub.problem_id._id : sub.problem_id;
            if (sub.verdict === 'Accepted' && pid) {
                solvedSet.add(pid.toString());
            }
        });
        // Count per difficulty
        let t = [0, 0, 0];
        let s = [0, 0, 0];
        (problems || []).forEach(prob => {
            if (!prob || !prob._id) return; // null check
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
            setProblems(problems.filter(p => p._id !== problemId));
            setDeleteMsg("Problem deleted successfully.");
            setTimeout(() => setDeleteMsg(""), 2000);
        } catch (err) {
            setDeleteMsg("Failed to delete problem.");
            setTimeout(() => setDeleteMsg(""), 2000);
        }
    };

    const handleDeleteContest = async (contestId) => {
        if (!window.confirm("Are you sure you want to delete this contest? This will also update all related submissions.")) return;
        try {
            await axios.delete(`http://localhost:3000/admin/contests/${contestId}`, { withCredentials: true });
            setCreatedContests(createdContests.filter(c => c._id !== contestId));
        } catch (err) {
            alert("Failed to delete contest.");
        }
    };

    // Calculate badges
    const solvedTotal = solved.reduce((a, b) => a + b, 0);
    const bestRank = attendedContests.length > 0 ? Math.min(...attendedContests.map(c => c.userStats?.rank || 9999)) : null;
    const isNewUser = user && user.createdAt && (new Date() - new Date(user.createdAt)) < 7 * 24 * 60 * 60 * 1000;
    const has100Solved = solvedTotal >= 100;

    if (!user || loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress size={60} thickness={5} /></div>;
    }

    return (
        <Box className="profile-root">
            <div className="profile-banner"></div>
            <Card className="profile-header-card">
                <Avatar className="profile-avatar">
                    {user.firstname?.[0]?.toUpperCase()}{user.lastname?.[0]?.toUpperCase()}
                </Avatar>
                <Box className="profile-header-info">
                    <Typography variant="h4" fontWeight={700}>
                        {user.firstname} {user.lastname}
                        {isNewUser && <span className="profile-badge">New</span>}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">{user.email}</Typography>
                </Box>
            </Card>
            {/* Row: Solved Problems + Participated Contests */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                {/* Solved Problems Section */}
                <Card className="profile-section-card" sx={{ flex: 1, mb: 0 }}>
                    <Typography className="profile-section-title">Solved Problems</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                        {[0, 1, 2].map((idx) => {
                            const colors = ['#43a047', '#ffb300', '#e53935'];
                            const labelColors = ['#43a047', '#ffb300', '#e53935'];
                            const labels = ['Easy', 'Medium', 'Hard'];
                            const value = total[idx] ? Math.round((solved[idx] / total[idx]) * 100) : 0;
                            return (
                                <Box
                                    key={labels[idx]}
                                    textAlign="center"
                                    sx={{
                                        width: 90,
                                        height: 100,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            color: labelColors[idx],
                                            fontWeight: 700,
                                            fontSize: '1.1rem',
                                            mb: 0.5,
                                            letterSpacing: 0.2,
                                        }}
                                    >
                                        {labels[idx]}
                                    </Typography>
                                    <Box sx={{ position: 'relative', width: 70, height: 70, mb: 0.5 }}>
                                        <CircularProgress
                                            variant="determinate"
                                            value={100}
                                            size={70}
                                            thickness={6}
                                            sx={{ color: '#e0e0e0', position: 'absolute', left: 0, top: 0 }}
                                        />
                                        <CircularProgress
                                            variant="determinate"
                                            value={value}
                                            size={70}
                                            thickness={6}
                                            sx={{ color: colors[idx], position: 'absolute', left: 0, top: 0 }}
                                        />
                                        <Box sx={{
                                            position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            width: 70,
                                            height: 70,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            pointerEvents: 'none',
                                        }}>
                                            <Typography
                                                variant="h5"
                                                sx={{ fontWeight: 900, color: '#222', fontSize: '1.3rem' }}
                                            >
                                                {solved[idx]}/{total[idx]}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Card>
                {/* Participated Contests Section */}
                {attendedContests && attendedContests.length > 0 && (
                    <Card className="profile-section-card" sx={{ flex: 1, mb: 0 }}>
                        <Typography className="profile-section-title">Participated Contests</Typography>
                        <TableContainer className="profile-table-container" component={Paper}>
                            <Table className="profile-table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>S.No</TableCell>
                                        <TableCell>Contest Name</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Rank</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {attendedContests.map((contest, idx) => (
                                        <TableRow key={contest._id}>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell>
                                                <Link to={`/contests/${contest._id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>{contest.contestTitle}</Link>
                                            </TableCell>
                                            <TableCell>{formatFormalDate(contest.startTime)}</TableCell>
                                            <TableCell>{contest.userStats ? contest.userStats.rank : '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                )}
            </Box>
            {/* Contests Created By User Section */}
            {createdContests && createdContests.length > 0 && (
                <Card className="profile-section-card">
                    <Typography className="profile-section-title">Contests You Created</Typography>
                    <TableContainer className="profile-table-container" component={Paper}>
                        <Table className="profile-table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>S.No</TableCell>
                                    <TableCell>Contest Title</TableCell>
                                    <TableCell>Start Time</TableCell>
                                    <TableCell>End Time</TableCell>
                                    <TableCell>Problems</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {createdContests.map((contest, idx) => {
                                    const now = new Date();
                                    const start = new Date(contest.startTime);
                                    const canEdit = start > now;
                                    return (
                                        <TableRow key={contest._id}>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell>
                                                <Link to={`/contests/${contest._id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>{contest.contestTitle}</Link>
                                            </TableCell>
                                            <TableCell>{formatFormalDate(contest.startTime)}</TableCell>
                                            <TableCell>{formatFormalDate(contest.endTime)}</TableCell>
                                            <TableCell>{contest.problems ? contest.problems.length : 0}</TableCell>
                                            <TableCell>
                                                {canEdit && (
                                                    <Tooltip title="Edit" arrow>
                                                        <button className="profile-action-btn" onClick={() => navigate(`/contests/${contest._id}/edit`)}><EditIcon fontSize="small" /></button>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="Delete" arrow>
                                                    <button className="profile-action-btn" onClick={() => handleDeleteContest(contest._id)}><DeleteIcon fontSize="small" /></button>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}
            {/* Problems You Created Section */}
            {user && user.role === 'admin' && (
                <Card className="profile-section-card">
                    <Typography className="profile-section-title">Problems You Created</Typography>
                    <TableContainer className="profile-table-container" component={Paper}>
                        <Table className="profile-table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>S.No</TableCell>
                                    <TableCell>Problem Name</TableCell>
                                    <TableCell>Created At</TableCell>
                                    <TableCell>Edit</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {problemsByUser && problemsByUser.length > 0 ? (
                                    problemsByUser.map((problem, idx) => (
                                        <TableRow key={problem._id}>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell>{problem.problemName}</TableCell>
                                            <TableCell>{formatFormalDate(problem.CreatedAt)}</TableCell>
                                            <TableCell>
                                                <Tooltip title="Edit" arrow>
                                                    <Link to={`/problems/${problem._id}/edit`} style={{ color: '#1976d2', marginRight: 12 }}><EditIcon fontSize="small" /></Link>
                                                </Tooltip>
                                                <Tooltip title="Delete" arrow>
                                                    <button className="profile-action-btn" onClick={() => handleDeleteProblem(problem._id)}><DeleteIcon fontSize="small" /></button>
                                                </Tooltip>
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
            )}
            {/* Submissions Section */}
            <Card className="profile-section-card">
                <Typography className="profile-section-title">Your Submissions</Typography>
                <TableContainer className="profile-table-container" component={Paper}>
                    <Table className="profile-table">
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
                                submissionsByUser.map((submission, index) => {
                                    if (!submission || !submission._id || !submission.problem_id) return null;
                                    return (
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
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No submissions found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
            {deleteMsg && <div style={{ color: deleteMsg.includes('success') ? 'green' : 'red', marginBottom: 8 }}>{deleteMsg}</div>}
        </Box>
    );
}

export default Profile;