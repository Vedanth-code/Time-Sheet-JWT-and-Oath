import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Verify token with backend
        fetch('http://localhost:8080/api/verify', {
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
        return <div>Loading...</div>;
    }

    // Redirect to login if not authenticated
    return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
