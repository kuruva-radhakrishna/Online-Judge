import { useState } from "react";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import './SignUp.css';

function SignUp() {
    const [firstname , setFirstname] = useState("");
    const [lastname , setLastname] = useState("");
    const [email , setEmail] = useState("");
    const [password , setPassword] = useState(""); 
    const navigate = useNavigate();
    const handleSubmit = async function(e){
        e.preventDefault();
        try {
            const result =  await axios.post("http://localhost:3000/register",{
                firstname : firstname,
                lastname : lastname,
                email : email,
                password : password
            });
            console.log(result);
            navigate('/problems');
        } catch (error) {
            console.log(error);
            alert('Internal Server Issue');
        }
    }
    return (
        <Box className="signup-bg">
            <Box className="signup-card" component="form" onSubmit={handleSubmit}>
                {/* <img src="/logo192.png" alt="Logo" className="signup-logo" /> */}
                <Typography variant="h5" className="signup-title" mb={2} fontWeight={700} align="center">Sign Up</Typography>
                <TextField label="First Name" variant="outlined" fullWidth margin="normal" value={firstname} onChange={e => setFirstname(e.target.value)} />
                <TextField label="Last Name" variant="outlined" fullWidth margin="normal" value={lastname} onChange={e => setLastname(e.target.value)} />
                <TextField label="Email" type="email" variant="outlined" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
                <TextField label="Password" type="password" variant="outlined" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
                <Button variant="contained" color="primary" fullWidth sx={{ mt: 2, mb: 1, py: 1.2, fontWeight: 600, fontSize: '1.1rem' }} type="submit">Sign Up</Button>
                <Typography variant="body2" align="center" className="signup-link">
                    Already have an account? <Link to="/login">Login</Link>
                </Typography>
                {/*
                <Typography variant="body2" align="center" color="textSecondary" mt={2} mb={1}>
                    or you can sign up with
                </Typography>
                <Box className="signup-socials" display="flex" justifyContent="center" gap={2} mt={1}>
                    <GoogleIcon className="signup-social-icon" />
                    <GitHubIcon className="signup-social-icon" />
                    <FacebookIcon className="signup-social-icon" />
                    <MoreHorizIcon className="signup-social-icon" />
                </Box>
                */}
            </Box>
        </Box>
    );
}

export default SignUp;