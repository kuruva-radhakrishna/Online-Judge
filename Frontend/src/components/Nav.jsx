import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link, useNavigate } from 'react-router-dom';
import './Nav.css';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function Nav() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/logout', {}, { withCredentials: true });
      setUser(null);
      navigate('/login');
    } catch (err) {
      // handle error
    }
  };

  return (
    <AppBar position="static" className="nav-appbar" mb="5" component="nav">
      <Toolbar>
        <Link to="/" className="navbar-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#ffa116', fontWeight: 700, fontSize: '1.7rem', fontFamily: 'monospace' }}>O</span>
          <span style={{ color: '#222', fontWeight: 700, fontSize: '1.7rem', fontFamily: 'monospace' }}>J</span>
        </Link>
        <Typography variant="h6" className="nav-title" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          Online Judge
        </Typography>
        {user && (
          <>
            <Button color="inherit" component={Link} to="/problems" className="nav-link">Problems</Button>
            <Button color="inherit" component={Link} to="/contests" className="nav-link">Contests</Button>
            <Link to="/profile" className="nav-link nav-profile-circle">
              {user?.firstname?.[0]?.toUpperCase()}{user?.lastname?.[0]?.toUpperCase() || (!user?.firstname && 'U')}
            </Link>
            <Button color="inherit" onClick={handleLogout} className="nav-link">Logout</Button>
          </>
        )}
        {!user && (
          <>
            <Button color="inherit" component={Link} to="/login" className="nav-link">Login</Button>
            <Button color="inherit" component={Link} to="/signup" className="nav-link">Sign Up</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Nav; 