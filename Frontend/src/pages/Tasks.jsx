import { useState } from 'react';
import Header from '../components/Header';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpRight, DollarSign, Clock, AlertCircle, Filter, Download } from 'lucide-react';
import '../index.css';
import './Dashboard.css';
import { formatDuration } from './Body';
import TaskDetailsModal from '../components/TaskDetailsModal';

const data = [
    { day: 'Mon', hours: 7.5 },
    { day: 'Tue', hours: 8.0 },
    { day: 'Wed', hours: 6.5 },
    { day: 'Thu', hours: 9.0 },
    { day: 'Fri', hours: 5.5 },
];

const COLORS = ['#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6'];

function Tasks({ totalDurationMs, tasks }) {
    console.log("the tASKS ARE ............... ", tasks)

    const [selectedTask, setSelectedTask] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    return (
        <div className="page-content">
            <Header title="Tasks" />

            <TaskDetailsModal
                show={isModalOpen}
                task={selectedTask}
                onClose={handleCloseModal}
            />

            {/* Controls */}
            {/* <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-600">Date Range:</span>
                    <select className="input w-auto py-1 text-sm">
                        <option>This Month</option>
                        <option>Last Month</option>
                        <option>This Year</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-ghost border border-slate-200 bg-white"><Filter size={16} /> Filters</button>
                    <button className="btn btn-ghost border border-slate-200 bg-white"><Download size={16} /> Export CSV</button>
                </div>
            </div> */}

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

                    {/* Recent Activity */}
                    <div className="card activity-card">
                        <h3 className="card-title">All Tasks</h3>
                        <div className="activity-list">
                            {
                                tasks.map((t) => (
                                    <div key={t.id}>
                                        <div
                                            className="activity-item cursor-pointer hover:bg-slate-50 transition-colors p-2 rounded-lg"
                                            onClick={() => handleTaskClick(t)}
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
        </div>
    );
}

export default Tasks;
