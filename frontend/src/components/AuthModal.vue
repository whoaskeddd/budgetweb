<template>
  <div class="modal active">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ mode === 'login' ? 'Вход' : 'Регистрация' }}</h2>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="form.email" required>
        </div>
        <div class="form-group">
          <label>Пароль</label>
          <input type="password" v-model="form.password" required>
        </div>
        <div v-if="mode === 'signup'" class="form-group">
          <label>Подтвердите пароль</label>
          <input type="password" v-model="form.confirmPassword" required>
        </div>
        <button type="submit" class="btn primary full-width">
          {{ mode === 'login' ? 'Войти' : 'Зарегистрироваться' }}
        </button>
      </form>
      <div class="auth-switch">
        <p>
          {{ mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?' }}
          <button type="button" @click="$emit('toggle-mode')">
            {{ mode === 'login' ? 'Зарегистрироваться' : 'Войти' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'AuthModal', // Оставить как есть (уже multi-word)
  props: {
    mode: {
      type: String,
      default: 'login'
    }
  },
  emits: ['close', 'auth', 'toggle-mode'],
  setup(props, { emit }) {
    const form = ref({
      email: '',
      password: '',
      confirmPassword: ''
    })

    const handleSubmit = () => {
      if (props.mode === 'signup' && form.value.password !== form.value.confirmPassword) {
        alert('Пароли не совпадают!')
        return
      }
      emit('auth', form.value)
    }

    // Сбрасываем форму при изменении режима
    watch(() => props.mode, () => {
      form.value = {
        email: '',
        password: '',
        confirmPassword: ''
      }
    })

    return {
      form,
      handleSubmit
    }
  }
}
</script>