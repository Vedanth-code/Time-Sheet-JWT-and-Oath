import React from 'react';
import { X, Calendar, Clock, Image as ImageIcon } from 'lucide-react';
import './TaskDetailsModal.css';

const TaskDetailsModal = ({ show, task, onClose }) => {
    if (!show || !task) return null;

    const formatDate = (dateString, needsTime = true) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (needsTime) {
            return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        // Extract just the filename in case the path contains 'uploads/' or backslashes
        const filename = task.attachment_path;
        return `http://localhost:8080/images?filename=${filename}`;
    };

    const imageUrl = getImageUrl(task.attachment_path);

    return (
        <div className="task-modal-overlay" onClick={onClose}>
            <div
                className="task-modal-content"
                onClick={e => e.stopPropagation()}
            >
                <div className="task-modal-header">
                    {/* Top: Task Name (Bold and Large) */}
                    <h2 className="task-title">
                        {task.task_name || 'Untitled Task'}
                    </h2>

                    {/* Close Button at Top Right */}
                    <button
                        onClick={onClose}
                        className="close-btn"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="task-modal-body">
                    {/* Below it: Description in box shape covering entire width */}
                    <div className="section-box">
                        <span className="section-label">Description</span>
                        <p className="description-text">
                            {task.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* Below it: Start time and End time both in same row */}
                    <div className="time-row">
                        <div className="time-box">
                            <span className="section-label flex items-center gap-2">
                                <Calendar size={14} /> Start Time
                            </span>
                            <span className="time-value">
                                {formatDate(task.start_time || task.startTime)}
                            </span>
                        </div>
                        <div className="time-box">
                            <span className="section-label flex items-center gap-2">
                                <Calendar size={14} /> End Time
                            </span>
                            <span className="time-value">
                                {formatDate(task.end_time || task.endTime)}
                            </span>
                        </div>
                    </div>

                    {/* Finally: If image available, container to show image */}
                    {imageUrl && (
                        <div className="image-container">
                            <span className="section-label flex items-center gap-2 mb-2">
                                <ImageIcon size={14} /> Attachment
                            </span>
                            <img
                                src={imageUrl}
                                alt="Task Attachment"
                                className="task-image"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    console.error("Failed to load image:", imageUrl);
                                    e.target.parentElement.innerHTML += `<div class="p-2 text-sm text-red-500">Failed to load image: ${imageUrl}</div>`;
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetailsModal;
