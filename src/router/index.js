import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const Login = () => import('../components/login/login.vue')
const Main = () => import('../components/main/main.vue')

const routes = [
  {
    path: '',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/main',
    name: 'main',
    component: Main
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
