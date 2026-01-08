import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react'; // Import XCircle as well

const Popup = ({ show, type, title, message, onClose }) => {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {type === 'success' ? (
                    <CheckCircle className="modal-icon" color="#22c55e" />
                ) : (
                    // Using XCircle for error, or rotating CheckCircle like before if preferred.
                    // The previous code had `style={{ transform: 'rotate(45deg)' }}` on CheckCircle.
                    // XCircle is cleaner.
                    <XCircle className="modal-icon" color="#ef4444" />
                )}

                <h2 className="modal-title">{title}</h2>
                <p className="modal-message">{message}</p>

                <button
                    onClick={onClose}
                    className={`modal-btn ${type === 'error' ? 'error' : ''}`}
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default Popup;