import { defineStore } from 'pinia'
import api from '@/services/api'

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    token: localStorage.getItem('token') || '',
    username: localStorage.getItem('username') || '',
    osmId: localStorage.getItem('osmId') || 0,
  }),

  getters: {
    userData: (state) => ({ osm_id: state.osmId, username: state.username }),
    isLogged: (state) => (state.token ? true : false),
    isOwner: (state) => {
      return (owner) => owner && state.osmId == owner.osm_id
    },
  },

  actions: {
    login(session) {
      localStorage.removeItem('token')
      return new Promise((resolve, reject) => {
        api.getAuth(session).then((response) => {
          const token = response.data.session_token
          if (token) {
            localStorage.setItem('token', token)
            api.setAuth()
            this.token = token
            this.username = response.data.username
            this.osmId = response.data.osm_id
            localStorage.setItem('username', this.username)
            localStorage.setItem('osmId', this.osmId)
            resolve(response)
          } else {
            reject()
          }
        })
      })
    },
    logout() {
      return new Promise((resolve) => {
        this.$reset
        this.token = ''
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
        resolve()
      })
    },
    update() {
      return new Promise((resolve, reject) => {
        api
          .put('login')
          .then((response) => {
            this.token = localStorage.getItem('token') || ''
            this.username = localStorage.getItem('username') || ''
            this.osmId = localStorage.getItem('osmId') || 0
            resolve(response)
          })
          .catch(() => {
            this.logout()
            reject()
          })
      })
    },
  },
})
