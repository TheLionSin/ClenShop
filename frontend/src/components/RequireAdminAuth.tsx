import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface Props {
    children: React.ReactNode;
}

export const RequireAdminAuth: React.FC<Props> = ({ children }) => {
    const location = useLocation();
    const token = localStorage.getItem("access_token");

    if (!token) {
        return (
            <Navigate
                to="/admin/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return children;
};
