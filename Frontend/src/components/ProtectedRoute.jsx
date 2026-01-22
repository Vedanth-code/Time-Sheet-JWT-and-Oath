import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Verify token with backend
        fetch(`${import.meta.env.VITE_API_URL}/api/verify`, {
            method: 'GET',
            credentials: 'include' // Send HTTP-only cookie
        })
            .then(res => {
                if (res.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            })
            .catch(() => setIsAuthenticated(false))
            .finally(() => setIsLoading(false));
    }, []);

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="loading-overlay">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div className="loading-spinner"></div>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.95rem' }}>
                        Verifying Session...
                    </p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
