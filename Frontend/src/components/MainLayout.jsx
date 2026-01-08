import { useState, useEffect } from 'react';
import { Outlet, Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import Body from '../pages/Body';
// import Reports from '../pages/History';
import Tasks from '../pages/Tasks';
import Settings from '../pages/Settings';

const MainLayout = () => {
    // State management moved from App.jsx
    const [totalDurationMs, setTotalDurationMs] = useState(0);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Capture username from URL query params (from Google Auth redirect)
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const username = queryParams.get('username');

        if (username) {
            localStorage.setItem('username', username);
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    // Fetch data when this layout mounts (i.e., after login)
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("http://localhost:8080/api/getTask", {
                    method: "GET",
                    credentials: "include"
                });

                const result = await response.json();
                const tasksData = result.data || [];

                setTasks(tasksData);

                // Calculate total duration
                let total = 0;
                tasksData.forEach((t) => {
                    total += t.totalduration || 0;
                });
                setTotalDurationMs(total);

                console.log("Tasks loaded (MainLayout):", tasksData);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []); // Runs once when the layout mounts

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 main-offset">
                {loading ? (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                    </div>
                ) : (
                    <Routes>
                        <Route path="dashboard" element={<Dashboard totalDurationMs={totalDurationMs} tasks={tasks} />} />
                        <Route path="timesheet" element={<Body totalDurationMs={totalDurationMs} setTotalDurationMs={setTotalDurationMs} tasks={tasks} setTasks={setTasks} />} />
                        {/* <Route path="history" element={<Reports />} /> */}
                        <Route path="tasks" element={<Tasks totalDurationMs={totalDurationMs} tasks={tasks} />} />
                        <Route path="settings" element={<Settings />} />

                        {/* Redirect / to dashboard relative to parent route */}
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                )}
            </main>
        </div>
    );
};

export default MainLayout;
