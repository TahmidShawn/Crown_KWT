import { useEffect, useState } from "react";

import AuthContext from "@/context/AuthContext";
import api from "@/api/axios";

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const getCurrentUser = async () => {
        try {
            setIsLoading(true);

            const response = await api.get("/auth/me");

            setUser(response.data.data);

            return response.data.data;
        } catch (error) {
            setUser(null);

            return null;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getCurrentUser();
    }, []);

    const isAuthenticated = Boolean(user);

    const refreshUser = () => {
        return getCurrentUser();
    };

    const clearUser = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                refreshUser,
                clearUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
