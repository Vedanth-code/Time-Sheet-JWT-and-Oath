import { useState } from 'react';
import Header from './components/Header';
import { Plus, Clock, Calendar } from 'lucide-react';
import './index.css'; // Ensure global styles are available

function Body(setTotalDurationMs) {
    // State
    const [tasks, setTasks] = useState([]);
    // const [totalDurationMs, setTotalDurationMs] = useState(0);
    const [startTimeValue, setStartTimeValue] = useState('');

    // Handlers
    function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        const stime = formData.get('stime');
        const etime = formData.get('etime');

        if (!stime || !etime) return;

        const start = new Date(stime);
        const end = new Date(etime);

        // Basic validation
        if (end <= start) {
            alert('End time must be after start time');
            return;
        }

        const diffMs = end - start;

        const newTask = {
            id: Date.now(),
            taskName: formData.get('tname'),
            description: formData.get('desc'),
            startTime: stime,
            endTime: etime,
            durationMs: diffMs
        };

        setTasks(prev => [...prev, newTask]);
        setTotalDurationMs(prev => prev + diffMs);

        e.target.reset();
        setStartTimeValue('');
    }

    function handleStartDateChange(e) {
        setStartTimeValue(e.target.value);
    }

    // Helpers for formatting
    const formatDuration = (ms) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}:${String(minutes).padStart(2, '0')}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    };

    return (
        <div className="page-content">
            <Header title="Timesheet" />

            <div className="container dashboard-grid">

                {/* Stats Card */}
                <div className="card stat-card w-full md:w-1/3">
                    <div className="icon-wrapper blue">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-secondary text-sm">Total Logged Hours</p>
                        <h3 className="text-xl font-bold">{formatDuration(totalDurationMs)} hrs</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Input Form */}
                    <div className="card">
                        <h3 className="card-title flex items-center gap-2">
                            <Plus size={18} /> New Entry
                        </h3>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="taskname">Task Name</label>
                                <input className="input" type="text" name="tname" id="taskname" placeholder="e.g. Project Alpha" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="description">Description</label>
                                <textarea className="input min-h-[80px]" name="desc" id="description" placeholder="What did you work on?"></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="startTime">Start Time</label>
                                    <input
                                        className="input"
                                        type="datetime-local"
                                        name="stime"
                                        id="startTime"
                                        onChange={handleStartDateChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="endTime">End Time</label>
                                    <input
                                        className="input"
                                        type="datetime-local"
                                        name="etime"
                                        id="endTime"
                                        min={startTimeValue}
                                        disabled={!startTimeValue}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary mt-2">
                                Add Entry
                            </button>
                        </form>
                    </div>

                    {/* Entries List */}
                    <div className="card lg:col-span-2">
                        <h3 className="card-title flex items-center gap-2">
                            <Calendar size={18} /> Logged Tasks
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-200">
                                    <tr>
                                        <th className="p-3 font-medium text-slate-500">Task</th>
                                        <th className="p-3 font-medium text-slate-500">Start / End</th>
                                        <th className="p-3 font-medium text-slate-500">Description</th>
                                        <th className="p-3 font-medium text-slate-500 text-right">Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-slate-400">
                                                No tasks logged yet.
                                            </td>
                                        </tr>
                                    )}
                                    {tasks.map((t) => (
                                        <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 last:border-0">
                                            <td className="p-3 font-medium text-slate-800">{t.taskName}</td>
                                            <td className="p-3 text-slate-500 text-xs">
                                                <div>{formatDate(t.startTime)}</div>
                                                <div>{formatDate(t.endTime)}</div>
                                            </td>
                                            <td className="p-3 text-slate-600 max-w-[200px] truncate">{t.description}</td>
                                            <td className="p-3 text-slate-900 font-mono text-right font-semibold">
                                                {formatDuration(t.durationMs)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Body;
