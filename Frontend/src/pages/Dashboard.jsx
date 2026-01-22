import { useMemo, useState } from 'react';
import Header from '../components/Header';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpRight, DollarSign, Clock, AlertCircle } from 'lucide-react';
import '../index.css';
import './Dashboard.css';
import { formatDuration } from './Body';
import TaskDetailsModal from '../components/TaskDetailsModal';

const COLORS = ['#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6'];

function Dashboard({ totalDurationMs, tasks }) {
    const [selectedTask, setSelectedTask] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedTask(null);
    };

    const chartData = useMemo(() => {
        const days = [];

        // Helper to get local date string YYYY-MM-DD
        const getLocalDateString = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Generate last 7 days from today
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = getLocalDateString(d);

            days.push({
                dateStr: dateStr,
                // Label format: "Mon 22"
                day: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
                hours: 0
            });
        }

        // Aggregate hours
        tasks.forEach(task => {
            if (!task.start_time) return;
            const taskDate = new Date(task.start_time);
            const taskDateStr = getLocalDateString(taskDate);

            const dayEntry = days.find(d => d.dateStr === taskDateStr);
            if (dayEntry) {
                dayEntry.hours += (task.totalduration / (1000 * 60 * 60));
            }
        });

        // Format for chart
        return days.map(d => ({
            day: d.day,
            hours: parseFloat(d.hours.toFixed(1))
        }));
    }, [tasks]);

    return (
        <div className="page-content">
            <Header title="Dashboard" />

            <div className="container dashboard-grid">

                {/* Summary Cards */}
                <div className="summary-cards">
                    <div className="card stat-card">
                        <div className="icon-wrapper blue">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-sm">Total Hours worked</p>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                {formatDuration(totalDurationMs)} hrs
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Charts & Activity */}
                <div className="charts-grid">

                    {/* Main Chart */}
                    <div className="card chart-card">
                        <h3 className="card-title">Hours Worked (Current Week)</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="card activity-card">
                        <h3 className="card-title">Recent Activity</h3>
                        <div className="activity-list">
                            {[...tasks].reverse().map((t) => (
                                <div key={t.id}>
                                    <div
                                        className="activity-item"
                                        onClick={() => handleTaskClick(t)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                handleTaskClick(t);
                                            }
                                        }}
                                    >
                                        <div className="activity-icon"></div>
                                        <div className="activity-details">
                                            <h4 className="text-sm font-medium">{t.task_name}</h4>
                                            <p className="text-xs text-secondary">{t.description}</p>
                                        </div>
                                        <span className="time-ago">{formatDuration(t.totalduration)}</span>
                                    </div>
                                    <hr />
                                </div>
                            ))}
                        </div>
                        <button className="btn btn-ghost w-full mt-4">View All Activity</button>
                    </div>
                </div>

            </div>

            <TaskDetailsModal
                show={showModal}
                task={selectedTask}
                onClose={handleCloseModal}
            />
        </div>
    );
}

export default Dashboard;
