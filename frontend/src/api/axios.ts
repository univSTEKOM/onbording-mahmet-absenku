import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  paramsSerializer: {
    indexes: null,
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    /* Normalize backend { success, error: { message } } ke format frontend */
    if (error.response?.data?.error?.message) {
      error.response.data.message = error.response.data.error.message
    }
    return Promise.reject(error)
  },
)

export default api
