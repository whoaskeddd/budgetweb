<template>
  <div id="app">
 <LandingPage 
  v-if="!isAuthenticated" 
  @open-auth="handleOpenAuth"
/>
    <Dashboard 
      v-else 
      :user="currentUser"
      @logout="handleLogout"
    />
    
    <AuthModal
      v-if="showAuthModal"
      :mode="authMode"
      @close="showAuthModal = false"
      @toggle-mode="toggleAuthMode"
      @auth="handleAuth"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import LandingPage from './components/LandingPage.vue'
import Dashboard from './components/Dashboard.vue'
import AuthModal from './components/AuthModal.vue'

export default {
  name: 'App',
  components: {
    LandingPage,
    Dashboard,
    AuthModal
  },
  setup() {
    const isAuthenticated = ref(false)
    const currentUser = ref(null)
    const showAuthModal = ref(false)
    const authMode = ref('login')

    // Проверяем авторизацию при загрузке приложения
   const checkAuthStatus = () => {
  console.log('Checking auth status...')
  const token = localStorage.getItem('userToken')
  const userData = localStorage.getItem('userData')
  
  console.log('Token from localStorage:', token)
  console.log('User data from localStorage:', userData)
  
  if (token && userData) {
    try {
      // Проверяем, является ли userData валидным JSON
      if (userData.trim().startsWith('{') || userData.trim().startsWith('[')) {
        currentUser.value = JSON.parse(userData)
        currentUser.value.token = token
        isAuthenticated.value = true
        console.log('User authenticated:', currentUser.value)
      } else {
        console.error('Invalid JSON format in userData')
        handleLogout()
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
      console.error('Problematic userData:', userData)
      handleLogout()
    }
  } else {
    isAuthenticated.value = false
    currentUser.value = null
    console.log('No authentication data found')
  }
}

const handleOpenAuth = (mode = 'login') => {
  console.log('Opening auth modal with mode:', mode)
  showAuthModal.value = true
  authMode.value = mode
}

  const handleAuth = async (authData) => {
  try {
    console.log('Auth attempt with data:', authData)
    
    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(authData.email)) {
      throw new Error('Введите корректный email адрес')
    }
    
    // Валидация пароля
    if (authData.password.length < 6) {
      throw new Error('Пароль должен содержать минимум 6 символов')
    }
    
    // Для регистрации проверяем подтверждение пароля
    if (authMode.value === 'signup') {
      if (authData.password !== authData.confirmPassword) {
        throw new Error('Пароли не совпадают')
      }
    }

    const endpoint = authMode.value === 'login' ? 'login' : 'register'
    const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: authData.email,
        password: authData.password
      })
    })

    console.log('Auth response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Auth error response:', errorText)
      
      try {
        const errorData = JSON.parse(errorText)
        throw new Error(errorData.error || 'Auth failed')
      } catch (parseError) {
        throw new Error(errorText || 'Ошибка авторизации')
      }
    }

    const data = await response.json()
    console.log('Auth success, user data:', data)
    
    // Проверяем структуру ответа
    if (!data.token || !data.user) {
      throw new Error('Неверный формат ответа от сервера')
    }
    
    // Сохраняем данные пользователя
    localStorage.setItem('userToken', data.token)
    localStorage.setItem('userData', JSON.stringify(data.user))
    
    currentUser.value = data.user
    currentUser.value.token = data.token
    isAuthenticated.value = true
    showAuthModal.value = false
    
    console.log('User authenticated successfully, loading data...')
    
  } catch (error) {
    console.error('Auth error:', error)
    alert(error.message || 'Ошибка авторизации')
  }
}
    const toggleAuthMode = () => {
      authMode.value = authMode.value === 'login' ? 'signup' : 'login'
      console.log('Auth mode toggled to:', authMode.value)
    }

    const handleLogout = () => {
      console.log('Logging out...')
      localStorage.removeItem('userToken')
      localStorage.removeItem('userData')
      localStorage.removeItem('budgetApp_transactions')
      localStorage.removeItem('budgetApp_categories')
      localStorage.removeItem('budgetApp_budgets')
      
      isAuthenticated.value = false
      currentUser.value = null
      showAuthModal.value = false
    }

    // Проверяем авторизацию при загрузке
    onMounted(() => {
      console.log('App mounted, checking auth...')
      checkAuthStatus()
    })

    return {
      isAuthenticated,
      currentUser,
      showAuthModal,
      authMode,
      handleOpenAuth,
      handleAuth,
      toggleAuthMode,
      handleLogout
    }
  }
}
</script>