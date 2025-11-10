<template>
    <div>
        <!-- Navigation Bar -->
        <nav class="navbar">
            <div class="nav-container">
                <div class="nav-brand">
                    <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                        </path>
                    </svg>
                    <span class="nav-title">BudgetApp</span>
                </div>
                <div class="nav-menu">
                    <button class="nav-btn" @click="handleLogin">Войти</button>
                    <button class="nav-btn primary" @click="handleSignUp">Регистрация</button>
                </div>
            </div>
        </nav>

        <main class="main-content">
            <section id="landing" class="page active">
                <div class="hero-section">
                    <div class="hero-content animate-fade-in-up">
                        <h1 class="hero-title">Твой бюджет.</h1>
                        <p class="hero-subtitle">
                            Возьмите под контроль своё финансовое будущее с помощью нашей удобной платформы управления бюджетом
                        </p>
                        <div class="hero-buttons">
                            <button class="btn large primary" @click="handleGetStarted">
                                Начать управлять деньгами
                                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <section class="features-section">
                    <div class="container">
                        <h2 class="section-title">Все, что вам нужно для управления финансами</h2>
                        <p class="section-subtitle">
                            От отслеживания расходов до планирования бюджета — у нас есть все необходимые инструменты.
                        </p>
                        <div class="features-grid">
                            <div class="feature-card animate-slide-in-left">
                                <div class="feature-icon">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <h3>Отслеживание транзакций</h3>
                                <p>Легко добавляйте и классифицируйте доходы и расходы с помощью интуитивного интерфейса</p>
                            </div>
                            <div class="feature-card animate-slide-in-left">
                                <div class="feature-icon">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <h3>Интеллектуальные категории</h3>
                                <p>Организуйте расходы с помощью настраиваемых категорий и автоматических предложений</p>
                            </div>
                            <div class="feature-card animate-slide-in-left">
                                <div class="feature-icon">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                </div>
                                <h3>Планирование бюджета</h3>
                                <p>Устанавливайте реалистичные бюджеты и отслеживайте прогресс с помощью визуальных данных и уведомлений</p>
                            </div>
                        </div>
                    </div>
                </section>
            </section>
        </main>
    </div>
</template>

<script>
export default {
  name: 'LandingPage',
  emits: ['open-auth'],
  methods: {
    handleGetStarted() {
      console.log('Get Started button clicked');
      this.$emit('open-auth', 'signup');
    },
    handleLogin() {
      console.log('Login button clicked');
      this.$emit('open-auth', 'login');
    },
    handleSignUp() {
      console.log('Sign Up button clicked');
      this.$emit('open-auth', 'signup');
    }
  }
}
</script>