import axios from 'axios'

const api = axios.create({
	baseURL: process.env.REACT_APP_BASE_URL,
	withCredentials: true,
	headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	}
})

api.defaults.timeout = 10000

api.interceptors.request.use(
	config => {
		const token = localStorage.getItem('token')
		if (token) {
			config.headers.common['token'] = token
		}
		return config
	},
	error => {
		return Promise.reject(error)
	}
)

api.interceptors.response.use(
	response => {
		if (response.status === 200 || response.status === 201) {
			return Promise.resolve(response.data)
		} else {
			return Promise.reject(response.data || response)
		}
	},
	error => {
		if (error.response && error.response.status) {
			switch (error.response.status) {
				case 401:
					const token = localStorage.getItem('token')
					if (token) {
						localStorage.removeItem('token')
						window.location.reload()
					}
					break
				case 404:
					console.error('No such page')
					break
				default:
					break
			}
			return Promise.reject(error.response.data)
		} else {
			console.error(error)
		}
	}
)

export default api