import React, { useState } from "react";

const API_BASE_URL = "http://localhost:8080";

export const AuthRegisterPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(API_BASE_URL + "/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            alert("Регистрация успешна!");
        } catch (e: any) {
            setError(e.message);
        }

        setLoading(false);
    }

    return (
        <div className="max-w-sm mx-auto p-6 bg-white mt-10 rounded shadow">
            <h1 className="text-xl font-bold mb-4 text-center">Регистрация</h1>
            {error && <div className="text-red-600 mb-2">{error}</div>}

            <form className="space-y-4" onSubmit={handleSubmit}>
                <input
                    className="w-full border p-2 rounded"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    className="w-full border p-2 rounded"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    className="w-full bg-green-600 text-white py-2 rounded"
                    disabled={loading}
                >
                    {loading ? "Загрузка..." : "Создать аккаунт"}
                </button>
            </form>
        </div>
    );
};
