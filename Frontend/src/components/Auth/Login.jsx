import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './Login.css';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async function (e) {
        e.preventDefault();
        try {
            const result = await axios.post('http://localhost:3000/login', {
                email,
                password
            }, {
                withCredentials: true
            });
            console.log(result);
            navigate('/problems');
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <Box className="login-bg">
            <Box className="login-card" component="form" onSubmit={handleSubmit}>
                {/* <img src="/logo192.png" alt="Logo" className="login-logo" /> */}
                <Typography variant="h5" className="login-title" mb={2} fontWeight={700} align="center">Login</Typography>
                <TextField label="Email" type="email" variant="outlined" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
                <TextField label="Password" type="password" variant="outlined" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
                <Button variant="contained" color="primary" fullWidth sx={{ mt: 2, mb: 1, py: 1.2, fontWeight: 600, fontSize: '1.1rem' }} type="submit">Login</Button>
                <Typography variant="body2" align="center" className="login-link">
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </Typography>
            </Box>
        </Box>
    );
}

export default Login;