// frontend/src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",  // Match your backend port
});

export const fetchBugs = () => API.get("/bugs");
export const loginUser = (data) => API.post("/auth/login", data);
// Add more routes as needed
