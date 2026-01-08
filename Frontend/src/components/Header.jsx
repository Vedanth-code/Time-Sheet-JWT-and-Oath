import { Search, Bell } from 'lucide-react';
import './Header.css';

function Header({ title }) {
    return (
        <header className="header">
            <h1 className="page-title">{title}</h1>

            <div className="header-actions">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="Search..." />
                </div>

                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="notification-dot"></span>
                </button>
            </div>
        </header>
    );
}

export default Header;
