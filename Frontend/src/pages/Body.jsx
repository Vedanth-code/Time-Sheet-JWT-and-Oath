import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { Navigate, useNavigate } from 'react-router-dom';
import { Plus, Clock, Calendar } from 'lucide-react';
import Popup from '../components/Popup';
import '../index.css'; // Ensure global styles are available
import './Body.css';

// Helpers for formatting
function formatDuration(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${String(minutes).padStart(2, '0')}`;
};


function Body({ totalDurationMs, setTotalDurationMs, tasks, setTasks }) {
    let navigate = useNavigate();
    // const [totalDurationMs, setTotalDurationMs] = useState(0);
    const [startTimeValue, setStartTimeValue] = useState('');
    const [visible, setVisible] = useState(false);
    const [modalState, setModalState] = useState({
        show: false,
        type: 'success', // 'success' or 'error'
        title: '',
        message: ''
    });

    const formStyle = {
        display: visible ? 'flex' : 'none',
    }

    console.log("In Body, the total duration ms is ", totalDurationMs);
    console.log("Tasks  is ", tasks);


    async function handleSubmit(e) {
        e.preventDefault();
        console.log("Button clickedd......")
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


        console.log("............................................................the diff is ", diffMs);


        // setTasks(prev => [...prev, newTask]);
        setTotalDurationMs(prev => prev + diffMs);

        try {
            const uploadData = new FormData();
            uploadData.append('task_name', formData.get('tname') || "Coding");
            uploadData.append('description', formData.get('desc') || "Practicing problem solving");
            uploadData.append('start_date', stime);
            uploadData.append('end_date', etime);
            uploadData.append('totalduration', diffMs);

            // Append file if it exists (assuming input name is 'attachment')
            const file = formData.get('attachment');
            if (file) {
                uploadData.append('file', file);
            }
            console.log("THe file is ", file.name);

            const result =
                await fetch(`${import.meta.env.VITE_API_URL}/api/savetask`, {
                    method: "POST",
                    credentials: "include",
                    // Do NOT set Content-Type header for FormData, browser sets it with boundary
                    body: uploadData
                });

            const data = await result.json();
            console.log("The data status is ", data);
            if (data.status == 200) {
                setModalState({
                    show: true,
                    type: 'success',
                    title: 'Success!',
                    message: 'Task saved successfully!'
                });
            } else if (data.status == 401) {
                setModalState({
                    show: true,
                    type: 'error',
                    title: 'Session timeout',
                    message: data.message || 'Please login again.'
                });
                navigate('/login');
            } else {
                setModalState({
                    show: true,
                    type: 'error',
                    title: 'Task did not get saved',
                    message: data.message || 'Something went wrong. Please try again.'
                });
            }
            console.log(data);

            e.target.reset();

        } catch (error) {
            setModalState({
                show: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to connect to server.'
            });
        }

        setStartTimeValue('');
    }

    function handleStartDateChange(e) {
        setStartTimeValue(e.target.value);
    }

    const handleModalClose = () => {
        setModalState({ ...modalState, show: false });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    };

    return (
        <div className="page-content">
            <Header title="Timesheet" />

            <Popup
                show={modalState.show}
                type={modalState.type}
                title={modalState.title}
                message={modalState.message}
                onClose={handleModalClose}
            />

            <div className="container dashboard-grid">

                {/* Stats Card */}
                <div className="card stat-card w-full md:w-1/3">
                    <div className="icon-wrapper blue">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-secondary text-sm">Total Worked Hours</p>
                        <h3 className="text-xl font-bold">{formatDuration(totalDurationMs)} hrs</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Input Form */}
                    <div className="card">
                        <button onClick={() => setVisible(!visible)}>
                            <h3 className="card-title flex items-center gap-2">
                                <Plus size={18} /> New Entry
                            </h3>
                        </button>

                        <form style={formStyle} onSubmit={handleSubmit} id="createForm">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="taskname">Task Name</label>
                                <input className="input" type="text" name="tname" id="taskname" placeholder="e.g. Project Alpha" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="description">Description</label>
                                <textarea className="input min-h-[80px]" name="desc" id="description" placeholder="What did you work on?"></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="attachment">Attachment</label>
                                <input className="input" type="file" name="attachment" id="attachment" />
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
                    {/* <div className="card lg:col-span-2">
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
                    </div> */}
                </div>
            </div>
        </div>
    );
}
export { formatDuration };
export default Body;
