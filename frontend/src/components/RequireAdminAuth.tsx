// src/components/RequireAdminAuth.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface Props {
    children: React.ReactNode;
}

interface JwtPayload {
    role?: string;
    Role?: string;   // на всякий случай, если в токене ключ с большой буквы
    exp?: number;
}

function parseJwt(token: string): JwtPayload | null {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            window
                .atob(base64)
                .split("")
                .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

export const RequireAdminAuth: React.FC<Props> = ({ children }) => {
    const location = useLocation();
    const token = localStorage.getItem("access_token");

    // 1. Нет токена → на логин админа
    if (!token) {
        return (
            <Navigate
                to="/admin/login"
                replace
                state={{ from: location }}
            />
        );
    }

    const payload = parseJwt(token);

    // 2. Токен битый или протух → на логин
    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
        return (
            <Navigate
                to="/admin/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // 3. Проверяем роль (без учёта регистра)
    const rawRole = (payload.role ?? payload.Role ?? "").toString();
    const normalizedRole = rawRole.trim().toLowerCase();

    if (normalizedRole !== "admin") {
        // вообще не пускаем в /admin/*
        return <Navigate to="/" replace />;
    }

    // 4. Всё ок — админ
    return children;
};
