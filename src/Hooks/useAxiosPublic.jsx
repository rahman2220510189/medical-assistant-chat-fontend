import axios from "axios"

const axiosPublic = axios.create({
    baseURL: "https://medical-assistant-backend-og0t.onrender.com",
});


const useAxiosPublic = () => {
  return axiosPublic;
}

export default useAxiosPublic
