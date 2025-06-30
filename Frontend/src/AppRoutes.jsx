import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SignUp from './components/Auth/SignUp';
import Login from './components/Auth/Login';
import Problems from './components/Problems/Problems';
import Problem from './components/Problems/ProblemView';
import ProblemDescription from './components/Problems/ProblemDescription';
import ProblemSubmissions from './components/Problems/ProblemSubmissions';
import ProblemDiscussion from './components/Problems/ProblemDiscussion';
import Contests from './components/Contests/Contests';
import ContestLeaderBoard from './components/Contests/ContestLeaderBoard';
import ContestView from './components/Contests/ContestView';
import ContestDiscussions from './components/Contests/ContestDiscussions';
import ContestSubmissions from './components/Contests/ContestSubmissions';
import Nav from './components/Nav';
import SubmissionCodeView from './components/Problems/SubmissionCodeView';
import { useAuth } from './contexts/AuthContext';
import Profile from './components/Profile';
import Home from './components/Home';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null; // or a loading spinner
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function AppRoutes() {
  // Always show Nav
  return (
    <>
      <Nav />
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/problems" element={
            <ProtectedRoute>
              <Problems />
            </ProtectedRoute>
          } />
          <Route path="/problem/:id/*" element={
            <ProtectedRoute>
              <Problem />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="description" />} />
            <Route path="description" element={<ProblemDescription />} />
            <Route path="submissions" element={<ProblemSubmissions />} />
            <Route path="discussions" element={<ProblemDiscussion />} />
          </Route>
          <Route path='/contests' element={<Contests />} />
          <Route path='/contests/:id/*' element={<ContestView />} >
            <Route path='leaderboard' element={<ContestLeaderBoard />} />
            <Route path='submissions' element={<ContestSubmissions />} />
            <Route path='discussions' element={<ContestDiscussions />} />
          </Route>
          <Route path="/submission/:id" element={<SubmissionCodeView />} />
          <Route path='/profile' element = {<Profile />} />
        </Routes>
      </div>
    </>
  );
}

export default AppRoutes; 