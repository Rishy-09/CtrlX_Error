import React, {createContext, useState, useEffect, useContext} from "react";
import axiosInstance from "../utils/axiosInstance.js";
import { API_PATHS } from "../utils/apiPaths.js";

export const UserContext = createContext();

// Custom hook to use the UserContext
export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUserContext must be used within a UserProvider");
    }
    return context;
};

// Alias for useUserContext to maintain compatibility with chat system
export const useAuth = useUserContext;

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // New state to track loading

    useEffect(() => {
        if (user) return;

        const accessToken = localStorage.getItem("token");
        if(!accessToken) {
            setLoading(false); // Set loading to false if no token
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
                setUser(response.data.user); // Set user data from response
            }
            catch (error) {
                console.error("User not authenticated", error);
                clearUser();
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        }
        fetchUser();
    }, []);

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem("token", userData.token); // Save token to localStorage
        setLoading(false); // Set loading to false after updating user
    }

    const clearUser = () => {   
        setUser(null);
        localStorage.removeItem("token"); // Remove token from localStorage
    };

    return (
        <UserContext.Provider value={{ user, loading, updateUser, clearUser, token: localStorage.getItem("token") }}> 
            {children}
        </UserContext.Provider>
    );
}

// Export UserProvider directly to maintain compatibility
export { UserProvider };

export default UserProvider;