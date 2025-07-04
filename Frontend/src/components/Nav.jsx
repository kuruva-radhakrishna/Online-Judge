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
    <AppBar position="static" className="nav-appbar" mb="5" component="nav" elevation={0}>
      <Toolbar>
        <Link to="/" className="navbar-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginRight: 32 }}>
          <span style={{ display: 'flex', alignItems: 'center', marginRight: 10 }}>
            {/* Modern styled C and A logo, no circle */}
            <span style={{
              fontWeight: 900,
              fontSize: '2rem',
              color: '#fff',
              fontFamily: 'Segoe UI, Arial, sans-serif',
              letterSpacing: '-2px',
              marginRight: 2
            }}>C</span>
            <span style={{
              fontWeight: 900,
              fontSize: '2rem',
              color: '#ffa116',
              fontFamily: 'Segoe UI, Arial, sans-serif',
              letterSpacing: '-2px'
            }}>A</span>
          </span>
          <span className="ca-navbar-brand" style={{ 
            fontWeight: 700, 
            fontSize: '1.4rem', 
            color: '#222', 
            letterSpacing: '0.5px', 
            fontFamily: 'Segoe UI, Arial, sans-serif'
          }}>CodeArena</span>
        </Link>
        <div style={{ flexGrow: 1 }} />
        {user && (
          <>
            <Button color="inherit" component={Link} to="/problems" className="nav-link">Problems</Button>
            <Button color="inherit" component={Link} to="/contests" className="nav-link">Contests</Button>
            {user.role === 'admin' && (
              <>
                <Button color="inherit" component={Link} to="/problems/new" className="nav-link">Create New Problem</Button>
                <Button color="inherit" component={Link} to="/contests/new" className="nav-link">Create Contest</Button>
              </>
            )}
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