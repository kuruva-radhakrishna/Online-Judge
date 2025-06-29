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

function AppRoutes() {
  // Always show Nav
  return (
    <>
      <Nav />
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<h1>Welcome to Online Judge</h1>} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problem/:id/*" element={<Problem />}>
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
        </Routes>
      </div>
    </>
  );
}

export default AppRoutes; 