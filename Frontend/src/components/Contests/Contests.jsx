import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Contests.css";

function Contests() {
    const [contests, setContests] = useState([]);
    const [now, setNow] = useState(new Date());
    const { id } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await axios.get('http://localhost:3000/contests', {
                    withCredentials: true,
                });
                setContests(result.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return {
            date: date.toLocaleDateString('en-CA'),
            time: date.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };
    };

    const getDuration = (start, end) => {
        const durationMs = new Date(end) - new Date(start);
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const getCountdown = (start, end) => {
        const now = new Date();
        const startTime = new Date(start);
        const endTime = new Date(end);

        let target, status;

        if (now < startTime) {
            target = startTime;
            status = "Starts in";
        } else if (now >= startTime && now < endTime) {
            target = endTime;
            status = "Ends in";
        } else {
            return { text: "Contest Over", status: "Over" };
        }

        const diff = target - now;

        const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
        const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');

        return { text: `${hours}:${minutes}:${seconds}`, status };
    };

    // Separate contests
    const present = contests.filter(contest => {
        const start = new Date(contest.startTime);
        const end = new Date(contest.endTime);
        return now >= start && now < end;
    });
    const future = contests.filter(contest => {
        const start = new Date(contest.startTime);
        return now < start;
    });
    const past = contests.filter(contest => {
        const end = new Date(contest.endTime);
        return now >= end;
    });

    const renderTable = (data, label) => (
        <div className="contest-category">
            <h2>{label}</h2>
            {data.length === 0 ? (
                <div className="no-contests">No contests in {label.toLowerCase()}.</div>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Contest Name</th>
                            <th>Date & Time</th>
                            <th>Duration</th>
                            <th>Countdown</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((contest, index) => {
                            const { date, time } = formatDateTime(contest.startTime);
                            const duration = getDuration(contest.startTime, contest.endTime);
                            const countdown = getCountdown(contest.startTime, contest.endTime);
                            return (
                                <tr key={contest._id || index}>
                                    <td>{index + 1}</td>
                                    <td>{contest.contestTitle}</td>
                                    <td>{date} at {time}</td>
                                    <td>{duration}</td>
                                    <td>
                                        {countdown.status !== "Over" ? `${countdown.status}: ${countdown.text}` : countdown.text}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );

    return (
        <div className="contest-view">
            {renderTable(present, "Ongoing Contests")}
            {renderTable(future, "Upcoming Contests")}
            {renderTable(past, "Past Contests")}
        </div>
    );
}

export default Contests;
