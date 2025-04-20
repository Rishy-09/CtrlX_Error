import React, {createContext, useState, useEffect} from "react";
import axiosInstance from "../utils/axiosInstance.js";
import { API_PATHS } from "../utils/apiPaths.js";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // New state to track loading

    useEffect(() => {
        // Only fetch if no user is set and we're still in loading state
        if (user) return;

        const accessToken = localStorage.getItem("token");
        if(!accessToken) {
            setLoading(false); // Set loading to false if no token
            return;
        }

        // Skip if we already attempted to fetch the user
        if (!loading) return;

        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
                setUser(response.data);
            }
            catch (error) {
                console.error("User not authenticated", error);
                clearUser();
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        }
        fetchUser();
    }, [user, loading]); // Added dependencies to prevent infinite loops

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
        <UserContext.Provider value={{ user, loading, updateUser, clearUser }}> 
            {children}
        </UserContext.Provider>
    );
}

export default UserProvider;