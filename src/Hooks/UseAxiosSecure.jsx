import axios from "axios";

// 1. Create a single, pre-configured Axios instance.
const axiosSecure = axios.create({
    // Set the base URL for all API requests to your backend server.
    baseURL: 'https://smart-task-manager-server-delta.vercel.app',

    // IMPORTANT: This tells Axios to automatically send cookies (like the session cookie)
    // with every request. This is what makes session-based authentication work.
    withCredentials: true,
});

/**
 * A simple React hook that returns the pre-configured secure Axios instance.
 * Any component can use this hook to make authenticated API calls.
 */
const useAxiosSecure = () => {
    return axiosSecure;
};

export default useAxiosSecure;