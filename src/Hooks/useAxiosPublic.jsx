import axios from "axios"

const axiosPublic = axios.create({
    baseURL: "https://medical-assistant-backend-h97o.onrender.com",
});


const useAxiosPublic = () => {
  return axiosPublic;
}

export default useAxiosPublic
