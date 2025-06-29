import { useParams, Link } from "react-router-dom";

function ProblemSubmissions({ submissions, refreshSubmissions }) {
    return (
        <div className="problem-submissions">
            <table>
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Language</th>
                        <th>Verdict</th>
                        <th>Submitted At</th>
                        <th>View</th>
                    </tr>
                </thead>
                <tbody>
                    {console.log(submissions)}
                    {submissions && submissions.length > 0 ? (
                        submissions.map((submission, index) => (
                            <tr key={submission._id}>
                                <td>{index + 1}</td>
                                <td>{submission.language}</td>
                                <td>{submission.verdict}</td>
                                <td>{new Date(submission.submittedAt).toLocaleString()}</td>
                                <td>
                                    <Link to={`/submission/${submission._id}`} className="view-code-link">View Code</Link>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center' }}>No submissions found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ProblemSubmissions;
