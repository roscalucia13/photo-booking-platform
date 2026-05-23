import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute({ isAuthenticated }) {
    return isAuthenticated ? <Outlet /> : <Navigate to="/access-denied" replace />;
}

export default ProtectedRoute;
