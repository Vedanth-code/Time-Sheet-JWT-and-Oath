// import { useState, useEffect } from 'react';
// import Header from '../components/Header';
// import { getEntries } from '../utils/storage';
// import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
// import { Download, Filter } from 'lucide-react';

// function Reports() {
//     const [entries, setEntries] = useState([]);

//     useEffect(() => {
//         setEntries(getEntries());
//     }, []);

//     // Aggregation for charts
//     const projectData = entries.reduce((acc, entry) => {
//         const existing = acc.find(item => item.name === entry.projectName);
//         const duration = parseFloat(entry.duration);
//         if (existing) {
//             existing.value += duration;
//         } else {
//             acc.push({ name: entry.projectName || 'Unassigned', value: duration });
//         }
//         return acc;
//     }, []);

//     const COLORS = ['#3b82f6', '#8b5cf6', '#64748b', '#10b981'];

//     const totalHours = entries.reduce((acc, curr) => acc + parseFloat(curr.duration), 0).toFixed(1);
//     const billableHours = entries.filter(e => e.billable).reduce((acc, curr) => acc + parseFloat(curr.duration), 0).toFixed(1);

//     return (
//         <div className="page-content">
//             <Header title="Reports" />

//             <div className="p-8 max-w-7xl mx-auto space-y-8">

//                 {/* Controls */}
//                 <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border border-slate-200">
//                     <div className="flex items-center gap-4">
//                         <span className="text-sm font-medium text-slate-600">Date Range:</span>
//                         <select className="input w-auto py-1 text-sm">
//                             <option>This Month</option>
//                             <option>Last Month</option>
//                             <option>This Year</option>
//                         </select>
//                     </div>
//                     <div className="flex gap-2">
//                         <button className="btn btn-ghost border border-slate-200 bg-white"><Filter size={16} /> Filters</button>
//                         <button className="btn btn-ghost border border-slate-200 bg-white"><Download size={16} /> Export CSV</button>
//                     </div>
//                 </div>

//                 {/* Stats */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                     <div className="card p-4">
//                         <p className="text-sm text-slate-500">Total Hours</p>
//                         <h3 className="text-2xl font-bold">{totalHours}</h3>
//                     </div>
//                     <div className="card p-4">
//                         <p className="text-sm text-slate-500">Billable Amount</p>
//                         <h3 className="text-2xl font-bold">${(billableHours * 50).toLocaleString()} <span className="text-xs font-normal text-slate-400">(@ $50/hr)</span></h3>
//                     </div>
//                 </div>

//                 {/* Charts */}
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                     <div className="card">
//                         <h3 className="text-lg font-semibold mb-6">Time by Project</h3>
//                         <div className="h-[250px] w-full flex items-center justify-center">
//                             {projectData.length > 0 ? (
//                                 <ResponsiveContainer width="100%" height="100%">
//                                     <PieChart>
//                                         <Pie
//                                             data={projectData}
//                                             cx="50%"
//                                             cy="50%"
//                                             innerRadius={60}
//                                             outerRadius={80}
//                                             paddingAngle={5}
//                                             dataKey="value"
//                                         >
//                                             {projectData.map((entry, index) => (
//                                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                                             ))}
//                                         </Pie>
//                                         <Tooltip />
//                                     </PieChart>
//                                 </ResponsiveContainer>
//                             ) : (
//                                 <p className="text-slate-400 text-sm">No data available</p>
//                             )}
//                         </div>
//                         <div className="flex flex-wrap gap-4 justify-center mt-4">
//                             {projectData.map((entry, index) => (
//                                 <div key={index} className="flex items-center gap-2 text-xs">
//                                     <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
//                                     <span>{entry.name}</span>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     <div className="card lg:col-span-2">
//                         <h3 className="text-lg font-semibold mb-6">Detailed Log</h3>
//                         <div className="overflow-x-auto">
//                             <table className="w-full text-left text-sm">
//                                 <thead className="border-b border-slate-200">
//                                     <tr>
//                                         <th className="p-3 font-medium text-slate-500">Date</th>
//                                         <th className="p-3 font-medium text-slate-500">Project</th>
//                                         <th className="p-3 font-medium text-slate-500">Task</th>
//                                         <th className="p-3 font-medium text-slate-500 text-right">Hours</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {entries.slice(0, 5).map(entry => (
//                                         <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50">
//                                             <td className="p-3 text-slate-900">{entry.date}</td>
//                                             <td className="p-3 text-slate-600">{entry.projectName}</td>
//                                             <td className="p-3 text-slate-600">{entry.task}</td>
//                                             <td className="p-3 text-slate-900 font-mono text-right">{entry.duration}</td>
//                                         </tr>
//                                     ))}
//                                     {entries.length === 0 && (
//                                         <tr>
//                                             <td colSpan="4" className="p-4 text-center text-slate-400">No entries found</td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>

//             </div>
//         </div>
//     );
// }

// export default Reports;
