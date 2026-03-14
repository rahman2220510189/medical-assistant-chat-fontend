import axios from "axios"

const axiosPublic = axios.create({
    baseURL: "https://medical-assistant-backend-1.onrender.com",
});


const useAxiosPublic = () => {
  return axiosPublic;
}

export default useAxiosPublic
