import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ContestView.css";

function ContestView() {
    const [contest, setContest] = useState([]);
    const { id } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await axios.get(`http://localhost:3000/contests/${id}`, {
                    withCredentials: true,
                });
                if (!result || !result.data) {
                    console.log("No contests found");
                    return;
                }
                setContest(result.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, [id]);

    const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return {
            date: date.toLocaleDateString('en-CA'), // YYYY-MM-DD
            time: date.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit'
            }),
        };
    };

    const getDuration = (start, end) => {
        const durationMs = new Date(end) - new Date(start);
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };
    const now = new Date()
    if(now<contest.startTime){
        return <h1>This Contest Isn't Live yet</h1>
    }

    return (
        <div className="contest-view">
            <h1>{contest.contestTitle}</h1>
        </div>
            
    );
}

export default ContestView;
