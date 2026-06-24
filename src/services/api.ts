import axios from "axios";

const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/"
});

API.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            if (config.headers && typeof config.headers.set === "function") {
                config.headers.set("Authorization", `Bearer ${token}`);
            } else {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    }

    // Add debug logging to browser terminal to verify headers are sent
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        let decodedRole = "unknown";
        try {
            if (token) {
                const parts = token.split(".");
                if (parts.length > 1) {
                    const payload = JSON.parse(atob(parts[1]));
                    decodedRole = payload.role || "none";
                }
            }
        } catch (e) {}

        const authHeader = config.headers?.Authorization || (config.headers?.get && config.headers.get("Authorization"));
        console.warn(`[API REQUEST DEBUG] ${config.method?.toUpperCase()} ${config.url} | Token Present: ${!!token} | Header: ${authHeader ? "Bearer (present)" : "None"} | Decoded Role in JWT: ${decodedRole}`);
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;