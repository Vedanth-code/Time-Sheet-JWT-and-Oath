import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Clock, FolderKanban, BarChart3, Settings, LogOut } from 'lucide-react';
import './Sidebar.css';

function Sidebar() {
    const navigate = useNavigate();
    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
        { icon: <Clock size={20} />, label: 'Timesheet', path: '/timesheet' },
        { icon: <FolderKanban size={20} />, label: 'Tasks', path: '/tasks' }, // Placeholder
        // { icon: <History size={20} />, label: 'History', path: '/history' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/settings' }, // Placeholder
    ];

    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/logout", {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                localStorage.removeItem('username');
                navigate('/');
            } else {
                console.error("Logout failed");
            }
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="logo-icon">T</div>
                <span className="logo-text">TimeTrack</span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        {item.icon}
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="nav-item w-full border-none bg-transparent cursor-pointer text-left mb-2">
                    <LogOut size={20} />
                    <span className="nav-label">Logout</span>
                </button>
                <div className="user-profile">
                    <img
                        src={`https://ui-avatars.com/api/?name=${localStorage.getItem('username') || 'User'}&background=e2e8f0&color=64748b`}
                        alt="User"
                        className="user-avatar"
                    />
                    <div className="user-info">
                        <span className="user-name">{localStorage.getItem('username') || 'User'}</span>
                        <span className="user-role">Employee</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
