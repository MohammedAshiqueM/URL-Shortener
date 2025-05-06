import axios from 'axios'
import { baseURL } from './constants'


const api = axios.create({
    baseURL: baseURL,

})

api.interceptors.request.use(
    (config)=>{
        const accessToken = localStorage.getItem('access')
        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        console.log("this is config.....",config)
        return config
    }
)

api.interceptors.response.use(
    (response) => response,
    async (error) =>{
        const originalRequest = error.config
        if(error.response?.status === 401 && !originalRequest._retry){
            originalRequest._retry = true

            try{
                const refresh = localStorage.getItem('refresh')
                const res = await api.post('api/token/refresh/',{refresh})

                const newAccess = res.data.access
                localStorage.setItem('access',newAccess)

                originalRequest.headers.Authorization = `Bearer ${newAccess}`
                return api(originalRequest)
            }catch(error){
                localStorage.removeItem('access')
                localStorage.removeItem('refresh')
                // window.location.href = '/'
                return Promise.reject(error)
            }
        }
        return Promise.reject(error)
    }
    
)
export default api