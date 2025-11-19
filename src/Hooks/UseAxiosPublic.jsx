import axios from "axios";

const axiosPublic = axios.create({
    baseURL: 'https://smart-task-manager-server-delta.vercel.app' 
   
});

const useAxiosPublic = () => {
    return axiosPublic;
};

export default useAxiosPublic;