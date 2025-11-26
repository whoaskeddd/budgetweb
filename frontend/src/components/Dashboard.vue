<template>
  <section class="dashboard-page">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <h1>Панель управления</h1>
      <div class="user-menu">
        <span>{{ currentUser.email }}</span>
        <button class="btn secondary" @click="logout">Выйти</button>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div class="dashboard-content">
      <!-- Statistics Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon income">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <div class="stat-info">
            <h3>Общий доход</h3>
            <div class="stat-value">₽{{ totalIncome.toFixed(2) }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon expense">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
            </svg>
          </div>
          <div class="stat-info">
            <h3>Общие расходы</h3>
            <div class="stat-value">₽{{ totalExpenses.toFixed(2) }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon balance">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M3 12h18M3 18h18"></path>
            </svg>
          </div>
          <div class="stat-info">
            <h3>Баланс</h3>
            <div class="stat-value" :class="balance >= 0 ? 'text-success' : 'text-error'">
              ₽{{ balance.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'transactions' }"
          @click="switchTab('transactions')"
        >
          Транзакции
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'categories' }"
          @click="switchTab('categories')"
        >
          Категории
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'budget' }"
          @click="switchTab('budget')"
        >
          Бюджет
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Transactions Tab -->
        <div v-if="activeTab === 'transactions'" class="tab-pane active">
          <div class="section-header">
            <h2>Транзакции</h2>
            <button class="btn primary" @click="showTransactionModal = true">Добавить транзакцию</button>
          </div>
          <div class="transactions-list">
            <div v-if="userTransactions.length === 0" class="empty-state">
              <p>Нет транзакций. Добавьте первую, чтобы начать!</p>
            </div>
            <div 
              v-else
              v-for="transaction in sortedTransactions" 
              :key="transaction.id" 
              class="transaction-item"
            >
              <div class="transaction-info">
                <div class="transaction-description">{{ transaction.description }}</div>
                <div class="transaction-category">
                  {{ getCategoryName(transaction.category) }} • {{ formatDate(transaction.date) }}
                </div>
              </div>
              <div class="transaction-amount" :class="transaction.type">
                {{ transaction.type === 'income' ? '+' : '-' }}₽{{ transaction.amount.toFixed(2) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Categories Tab -->
        <div v-if="activeTab === 'categories'" class="tab-pane active">
          <div class="section-header">
            <h2>Категории</h2>
            <button class="btn primary" @click="showCategoryModal = true">Добавить категорию</button>
          </div>
          <div class="categories-grid">
            <div v-if="userCategories.length === 0" class="empty-state">
              <p>Нет категорий. Создайте первую категорию для организации транзакций!</p>
            </div>
            <div 
              v-else
              v-for="category in userCategories" 
              :key="category.id" 
              class="category-item"
            >
              <div class="category-color" :style="{ backgroundColor: category.color }"></div>
              <div class="category-info">
                <div class="category-name">{{ category.name }}</div>
                <div class="category-type">{{ category.type === 'income' ? 'Доход' : 'Расход' }}</div>
              </div>
              <div class="category-actions">
                <button class="btn secondary btn-sm" @click="editCategory(category.id)">
                  Редактировать
                </button>
                <button class="btn danger btn-sm" @click="deleteCategory(category.id)">
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>

        
        <!-- Budget Tab -->
<div v-if="activeTab === 'budget'" class="tab-pane active">
  <div class="section-header">
    <h2>Планирование бюджета</h2>
    <button class="btn primary" @click="openBudgetModal">Установить бюджет</button>
  </div>
  
  <div class="budget-overview">
    <div v-if="userBudgets.length === 0" class="empty-state">
      <p>Настройте первый бюджет, чтобы отслеживать расходы!</p>
    </div>
<div 
  v-else
  v-for="budget in userBudgets" 
  :key="budget.id" 
  class="budget-item"
>
  <div class="budget-header">
    <div>
      <h3>{{ getCategoryName(budget.categoryId) }}</h3>
      <small class="text-muted">Период: {{ budget.period }}</small>
    </div>
    <div class="budget-actions">
      <span :class="isOverBudget(budget.categoryId) ? 'text-error' : 'text-success'">
        ₽{{ getSpentInCategory(budget.categoryId).toFixed(2) }}
      </span>
      <span class="text-muted"> / ₽{{ parseFloat(budget.amount).toFixed(2) }}</span>
      <button class="btn danger btn-sm" @click="deleteBudget(budget.id)" style="margin-left: 10px;">
        Удалить
      </button>
    </div>
  </div>
  <div class="budget-progress">
    <div 
      class="budget-progress-bar" 
      :class="{ 'over-budget': isOverBudget(budget.categoryId) }"
      :style="{ width: getBudgetProgress(budget.categoryId) + '%' }"
    ></div>
  </div>
</div>
  </div>
</div>
      </div>
    </div>

    <!-- Transaction Modal -->
    <div v-if="showTransactionModal" class="modal active">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Добавить транзакцию</h2>
          <button class="modal-close" @click="closeTransactionModal">×</button>
        </div>
        <form @submit.prevent="handleAddTransaction">
          <div class="form-group">
            <label>Тип</label>
            <select v-model="transactionForm.type" required>
              <option value="income">Доход</option>
              <option value="expense">Расход</option>
            </select>
          </div>
          <div class="form-group">
            <label>Сумма</label>
            <input type="number" v-model.number="transactionForm.amount" step="0.01" required>
          </div>
          <div class="form-group">
            <label>Категория</label>
            <select v-model="transactionForm.category" required>
              <option value="">Выберите категорию</option>
              <option v-for="category in userCategories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Описание</label>
            <input type="text" v-model="transactionForm.description" required>
          </div>
          <div class="form-group">
            <label>Дата</label>
            <input type="date" v-model="transactionForm.date" required>
          </div>
          <button type="submit" class="btn primary full-width">Добавить транзакцию</button>
        </form>
      </div>
    </div>

    <!-- Category Modal -->
    <div v-if="showCategoryModal" class="modal active">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingCategory ? 'Редактировать категорию' : 'Добавить категорию' }}</h2>
          <button class="modal-close" @click="closeCategoryModal">×</button>
        </div>
        <form @submit.prevent="handleAddCategory">
          <div class="form-group">
            <label>Название категории</label>
            <input type="text" v-model="categoryForm.name" required>
          </div>
          <div class="form-group">
            <label>Тип категории</label>
            <select v-model="categoryForm.type" required>
              <option value="expense">Расход</option>
              <option value="income">Доход</option>
            </select>
          </div>
          <div class="form-group">
            <label>Цвет</label>
            <input type="color" v-model="categoryForm.color" required>
          </div>
          <button type="submit" class="btn primary full-width">
            {{ editingCategory ? 'Обновить категорию' : 'Добавить категорию' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Budget Modal -->
    <!-- Budget Modal -->
<div v-if="showBudgetModal" class="modal active">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Установить бюджет</h2>
      <button class="modal-close" @click="closeBudgetModal">×</button>
    </div>
    
 
    
    <form @submit.prevent="handleSetBudget">
      <div class="form-group">
        <label>Категория</label>
        <select v-model="budgetForm.category" required>
          <option value="">Выберите категорию</option>
          <option 
            v-for="category in expenseCategories" 
            :key="category.id" 
            :value="category.id"
          >
            {{ category.name }} ({{ category.type }})
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>Месячный бюджет</label>
        <input type="number" v-model.number="budgetForm.amount" step="0.01" required>
      </div>
      <button type="submit" class="btn primary full-width">Установить бюджет</button>
    </form>
  </div>
</div>
  </section>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'

export default {
  name: 'BudgetDashboard',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  emits: ['logout'],
  setup(props, { emit }) {
    // Reactive state
    const currentUser = ref(props.user)
    const activeTab = ref('transactions')
    const transactions = ref([])
    const categories = ref([])
    const budgets = ref([])

    // Modal states
    const showTransactionModal = ref(false)
    const showCategoryModal = ref(false)
    const showBudgetModal = ref(false)
    const editingCategory = ref(null)

    // Forms
    const transactionForm = reactive({
      type: 'expense',
      amount: 0,
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    })

    const categoryForm = reactive({
      name: '',
      type: 'expense',
      color: '#3b82f6'
    })

    const budgetForm = reactive({
      category: '',
      amount: 0
    })

    // Computed properties
    const userTransactions = computed(() => {
      return transactions.value.filter(t => t.userId === currentUser.value.email)
    })

    const userCategories = computed(() => {
      return categories.value.filter(cat => 
        cat.user_id === currentUser.value?.userId || 
        (currentUser.value?.userId === undefined && cat.user_id === undefined)
      )
    })

const userBudgets = computed(() => {
  return budgets.value.filter(b => 
    b.userId === currentUser.value?.email || 
    b.user_id === currentUser.value?.id
  )
})
const expenseCategories = computed(() => {
  const categories = userCategories.value.filter(cat => cat.type === 'expense');
  console.log('💰 Expense categories computed:', categories);
  return categories;
});

    const sortedTransactions = computed(() => {
      return [...userTransactions.value].sort((a, b) => new Date(b.date) - new Date(a.date))
    })

    const totalIncome = computed(() => {
      return userTransactions.value
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
    })

    const totalExpenses = computed(() => {
      return userTransactions.value
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
    })

    const balance = computed(() => totalIncome.value - totalExpenses.value)

    // Methods
    const loadData = () => {
      // Load transactions
      const savedTransactions = localStorage.getItem('budgetApp_transactions')
      if (savedTransactions) {
        transactions.value = JSON.parse(savedTransactions)
      }

      // Load categories
      const savedCategories = localStorage.getItem('budgetApp_categories')
      if (savedCategories) {
        categories.value = JSON.parse(savedCategories)
      }

      // Load budgets
      const savedBudgets = localStorage.getItem('budgetApp_budgets')
      if (savedBudgets) {
        budgets.value = JSON.parse(savedBudgets)
      }
    }

onMounted(async () => {
  console.log('=== Dashboard mounted ===');
  console.log('👤 Current user on mount:', currentUser.value);
  
  // Сначала загружаем из localStorage для быстрого отображения
  loadData();
  console.log('📦 Initial budgets from localStorage:', budgets.value);
  
  // Затем загружаем актуальные данные из БД
  if (currentUser.value?.token) {
    console.log('🔄 Loading fresh data from DB...');
    await loadCategoriesFromDB();
    await loadTransactionsFromDB(); 
    await loadBudgetsFromDB(); // Важно: ждем завершения
    
    console.log('🎯 Final budgets state:', budgets.value);
    console.log('👤 Final userBudgets:', userBudgets.value);
  } else {
    console.error('❌ No token on mount!');
  }
});


   const saveData = () => {
  try {
    localStorage.setItem('budgetApp_transactions', JSON.stringify(transactions.value))
    localStorage.setItem('budgetApp_categories', JSON.stringify(categories.value))
    localStorage.setItem('budgetApp_budgets', JSON.stringify(budgets.value))
    
    console.log('💾 Data saved to localStorage:');
    console.log('  - Transactions:', transactions.value.length)
    console.log('  - Categories:', categories.value.length)
    console.log('  - Budgets:', budgets.value.length)
    console.log('  - Budgets data:', budgets.value)
  } catch (error) {
    console.error('❌ Error saving to localStorage:', error)
  }
}

    const switchTab = (tabName) => {
      activeTab.value = tabName
    }

    const getCategoryName = (categoryId) => {
      const category = categories.value.find(c => c.id == categoryId)
      return category ? category.name : 'Unknown'
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ru-RU')
    }

    const getSpentInCategory = (categoryId) => {
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      return userTransactions.value
        .filter(t => {
          const transactionDate = new Date(t.date)
          return (
            t.type === 'expense' &&
            t.category == categoryId &&
            transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear
          )
        })
        .reduce((sum, t) => sum + t.amount, 0)
    }

    const isOverBudget = (categoryId) => {
      const budget = userBudgets.value.find(b => b.categoryId === categoryId)
      if (!budget) return false
      return getSpentInCategory(categoryId) > budget.amount
    }

    const getBudgetProgress = (categoryId) => {
      const budget = userBudgets.value.find(b => b.categoryId === categoryId)
      if (!budget) return 0
      const spent = getSpentInCategory(categoryId)
      return Math.min((spent / budget.amount) * 100, 100)
    }

    // Transaction methods
   const handleAddTransaction = async () => {
  try {
    console.log('=== DEBUG: Starting transaction creation ===');
    
    if (!currentUser.value?.token) {
      console.error('No token found');
      alert('Токен отсутствует. Пожалуйста, войдите снова.');
      logout();
      return;
    }

    const transactionData = {
      amount: transactionForm.amount,
      category: parseInt(transactionForm.category),
      description: transactionForm.description.trim(),
      date: transactionForm.date,
      type: transactionForm.type
    };

    console.log('Transaction data:', transactionData);

    // Валидация
    if (!transactionData.description || transactionData.amount <= 0) {
      alert('Заполните все поля корректно');
      return;
    }

    console.log('Sending request to API...');

    const response = await fetch('http://localhost:5000/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.value.token}`
      },
      body: JSON.stringify(transactionData)
    });

    console.log('Response status:', response.status);

    if (response.status === 401) {
      console.error('Token expired or invalid');
      alert('Сессия истекла. Пожалуйста, войдите снова.');
      logout();
      return;
    }

    if (response.status === 400) {
      const errorData = await response.json();
      console.log('Validation error:', errorData);
      alert(errorData.error || 'Ошибка валидации данных');
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Server error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Success! Transaction created:', data);

    // Добавляем транзакцию в локальный state
    const transaction = {
      id: data.id,
      ...transactionData,
      userId: currentUser.value.email,
    };

    transactions.value.push(transaction);
    saveData();
    closeTransactionModal();
    
    alert('Транзакция успешно создана!');

  } catch (error) {
    console.error('Network error:', error);
    alert('Ошибка сети: ' + error.message);
  }
};

    const closeTransactionModal = () => {
      showTransactionModal.value = false
      Object.assign(transactionForm, {
        type: 'expense',
        amount: 0,
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
    }

    // Category methods
const handleAddCategory = async () => {
  try {
    console.log('=== DEBUG: Starting category creation ===');
    
    // Проверяем пользователя и токен
    if (!currentUser.value) {
      console.error('No current user');
      alert('Пользователь не найден. Пожалуйста, войдите снова.');
      return;
    }

    if (!currentUser.value.token) {
      console.error('No token found');
      alert('Токен отсутствует. Пожалуйста, войдите снова.');
      logout();
      return;
    }

    console.log('Current user:', currentUser.value);
    console.log('Token exists:', !!currentUser.value.token);
    console.log('Token length:', currentUser.value.token?.length);

    const categoryData = { 
      name: categoryForm.name.trim(),
      color: categoryForm.color,
      type: categoryForm.type
    };

    console.log('Category data:', categoryData);

    // Валидация
    if (!categoryData.name) {
      alert('Введите название категории');
      return;
    }

    console.log('Sending request to API...');

    const response = await fetch('http://localhost:5000/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.value.token}`
      },
      body: JSON.stringify(categoryData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.status === 401) {
      console.error('Token expired or invalid');
      // Попробуем обновить токен или разлогинить
      const responseText = await response.text();
      console.log('401 Response body:', responseText);
      
      alert('Сессия истекла. Пожалуйста, войдите снова.');
      logout();
      return;
    }

    if (response.status === 400) {
      const errorData = await response.json();
      console.log('Validation error:', errorData);
      alert(errorData.error || 'Ошибка валидации данных');
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Server error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Success! Category created:', data);

    // Добавляем категорию
    const category = {
      id: data.id,
      name: data.name,
      color: data.color,
      type: data.type,
      user_id: data.user_id
    };

    categories.value.push(category);
    saveData();
    closeCategoryModal();
    
    alert('Категория успешно создана!');

  } catch (error) {
    console.error('Network error:', error);
    alert('Ошибка сети: ' + error.message);
  }
};

    const editCategory = (categoryId) => {
      const category = categories.value.find(cat => cat.id === categoryId)
      if (category) {
        editingCategory.value = categoryId
        Object.assign(categoryForm, {
          name: category.name,
          type: category.type,
          color: category.color
        })
        showCategoryModal.value = true
      }
    }

    const deleteCategory = async (categoryId) => {
      if (!confirm('Вы уверены, что хотите удалить эту категорию?')) {
        return
      }

      try {
        if (!currentUser.value?.token) {
          alert('Пожалуйста, войдите в систему')
          return
        }

        const response = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${currentUser.value.token}`
          }
        })

        if (!response.ok) {
          throw new Error('Ошибка при удалении категории')
        }

        categories.value = categories.value.filter(cat => cat.id !== categoryId)
        saveData()
        alert('Категория успешно удалена!')

      } catch (error) {
        console.error('Error deleting category:', error)
        alert('Ошибка при удалении категории')
      }
    }



    
    const closeCategoryModal = () => {
      showCategoryModal.value = false
      editingCategory.value = null
      Object.assign(categoryForm, {
        name: '',
        type: 'expense',
        color: '#3b82f6'
      })
    }

    // Budget methods
  // Загрузка бюджетов из базы данных
// Загрузка бюджетов из базы данных
const loadBudgetsFromDB = async () => {
  try {
    if (!currentUser.value?.token) return;

    const response = await fetch('http://localhost:5000/api/budgets', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${currentUser.value.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      budgets.value = data.map(b => ({
        id: b.id,
        categoryId: b.category_id,
        amount: parseFloat(b.amount),
        period: b.period,
        userId: currentUser.value.email,
        user_id: b.user_id
      }));
      
      saveData();
    } else {
      loadData();
    }
  } catch (error) {
    console.error('Error loading budgets from DB:', error);
    loadData();
  }
};

const handleSetBudget = async () => {
  try {
    console.log('=== DEBUG: Starting budget creation ===');
    console.log('👤 Current user:', currentUser.value);
    
    if (!currentUser.value?.token) {
      console.error('No token found');
      alert('Токен отсутствует. Пожалуйста, войдите снова.');
      logout();
      return;
    }

    const budgetData = {
      category_id: parseInt(budgetForm.category),
      amount: budgetForm.amount,
      period: new Date().toISOString().slice(0, 7),
      user_id: currentUser.value.id || currentUser.value.userId // используем id
    };

    console.log('📤 Budget data for API:', budgetData);

    // Валидация
    if (!budgetData.category_id || budgetData.amount <= 0) {
      alert('Заполните все поля корректно');
      return;
    }

    console.log('Sending request to API...');

    const response = await fetch('http://localhost:5000/api/budgets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.value.token}`
      },
      body: JSON.stringify(budgetData)
    });

    console.log('Response status:', response.status);

    if (response.status === 401) {
      console.error('Token expired or invalid');
      alert('Сессия истекла. Пожалуйста, войдите снова.');
      logout();
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Server error:', errorText);
      
      if (response.status === 400) {
        await updateExistingBudget(budgetData);
        return;
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Success! Budget created in DB:', data);

    // Правильное преобразование данных
    const budget = {
      id: data.id,
      categoryId: data.category_id,
      amount: parseFloat(data.amount),
      period: data.period,
      userId: currentUser.value.email,
      user_id: data.user_id
    };

    // Удаляем существующий бюджет для этой категории
    budgets.value = budgets.value.filter(b => 
      !(b.categoryId === budget.categoryId && 
        (b.userId === budget.userId || b.user_id === budget.user_id))
    );
    
    budgets.value.push(budget);
    saveData();
    closeBudgetModal();
    
    alert('Бюджет успешно установлен!');

  } catch (error) {
    console.error('Network error:', error);
    alert('Ошибка сети: ' + error.message);
  }
};

// Метод для обновления существующего бюджета
const updateExistingBudget = async (budgetData) => {
  try {
    const response = await fetch('http://localhost:5000/api/budgets', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${currentUser.value.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const userBudgets = await response.json();
      const existingBudget = userBudgets.find(b => 
        b.category_id === budgetData.category_id && 
        b.period === budgetData.period &&
        (b.user_id === currentUser.value.id || b.user_id === currentUser.value.userId) // исправляем здесь
      );

      if (existingBudget) {
        const updateResponse = await fetch(`http://localhost:5000/api/budgets/${existingBudget.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.value.token}`
          },
          body: JSON.stringify(budgetData)
        });

        if (updateResponse.ok) {
          const updatedBudget = await updateResponse.json();
          console.log('✅ Budget updated in DB:', updatedBudget);

          // Обновляем в локальном state
          budgets.value = budgets.value.filter(b => 
            !(b.categoryId === updatedBudget.category_id && 
              (b.userId === currentUser.value.email || b.user_id === currentUser.value.userId))
          );
          
          budgets.value.push({
            id: updatedBudget.id,
            categoryId: updatedBudget.category_id,
            amount: updatedBudget.amount,
            period: updatedBudget.period,
            userId: currentUser.value.email,
            user_id: updatedBudget.user_id
          });
          
          saveData();
          closeBudgetModal();
          alert('Бюджет успешно обновлен!');
          return;
        }
      }
    }
    
    throw new Error('Failed to update budget');
  } catch (error) {
    console.error('Error updating budget:', error);
    alert('Ошибка при обновлении бюджета');
  }
};

// Метод для удаления бюджета
const deleteBudget = async (budgetId) => {
  if (!confirm('Вы уверены, что хотите удалить этот бюджет?')) {
    return;
  }

  try {
    if (!currentUser.value?.token) {
      alert('Пожалуйста, войдите в систему');
      return;
    }

    const response = await fetch(`http://localhost:5000/api/budgets/${budgetId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${currentUser.value.token}`
      }
    });

    if (!response.ok) {
      throw new Error('Ошибка при удалении бюджета');
    }

    // Удаляем из локального state
    budgets.value = budgets.value.filter(b => b.id !== budgetId);
    saveData();
    
    alert('Бюджет успешно удален!');

  } catch (error) {
    console.error('Error deleting budget:', error);
    alert('Ошибка при удалении бюджета');
  }
};

// Метод для открытия модального окна бюджета
const openBudgetModal = async () => {
  console.log('🎯 Opening budget modal...');
  
  showBudgetModal.value = true;
  
  // Всегда загружаем свежие категории
  console.log('🔄 Loading categories for budget modal...');
  console.log('Current categories count:', userCategories.value.length);
  
  try {
    await loadCategoriesFromDB();
    console.log('✅ Categories loaded, count:', userCategories.value.length);
    console.log('Expense categories:', expenseCategories.value);
  } catch (error) {
    console.error('❌ Failed to load categories:', error);
  }
  
  // Сбрасываем форму
  Object.assign(budgetForm, {
    category: '',
    amount: 0
  });
};

    const closeBudgetModal = () => {
      showBudgetModal.value = false
      Object.assign(budgetForm, {
        category: '',
        amount: 0
      })
    }

    const logout = () => {
      emit('logout')
    }
// Загрузка транзакций из базы данных
const loadTransactionsFromDB = async () => {
  try {
    if (!currentUser.value?.token) {
      console.error('No token for loading transactions');
      return;
    }

    console.log('📋 Loading transactions from database...');
    
    const response = await fetch('http://localhost:5000/api/transactions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${currentUser.value.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Transactions loaded from DB:', data.length, 'items');
      
      // Преобразуем данные для совместимости с фронтендом
      transactions.value = data.map(t => ({
        id: t.id,
        amount: parseFloat(t.amount),
        category: t.category_id,
        description: t.description,
        date: t.date,
        type: t.type || 'expense', // Добавляем тип по умолчанию
        userId: currentUser.value.email
      }));
      
      // Сохраняем в localStorage для кэша
      saveData();
    } else {
      console.error('❌ Failed to load transactions from DB:', response.status);
      // Если не удалось загрузить из БД, используем localStorage
      loadData();
    }
  } catch (error) {
    console.error('❌ Error loading transactions from DB:', error);
    // В случае ошибки используем данные из localStorage
    loadData();
  }
};
   // Загрузка категорий из API
const loadCategoriesFromDB = async () => {
  try {
    if (!currentUser.value?.token) return;

    console.log('📂 Loading categories from API...');
    
    const response = await fetch('http://localhost:5000/api/categories', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${currentUser.value.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Categories loaded from API:', data);
      
      // Преобразуем данные для совместимости с фронтендом
      categories.value = data.map(cat => ({
        id: cat.id,
        name: cat.name,
        color: cat.color || '#3b82f6',
        type: cat.type || 'expense',
        user_id: cat.user_id
      }));
      
      // Сохраняем в localStorage для кэша
      saveData();
    } else {
      console.error('❌ Failed to load categories:', response.status);
    }
  } catch (error) {
    console.error('❌ Error loading categories:', error);
  }
};

onMounted(async () => {
  console.log('=== Dashboard mounted ===');
  console.log('👤 Current user on mount:', currentUser.value);
  
  // Сначала загружаем из localStorage для быстрого отображения
  loadData();
  console.log('📦 Initial budgets from localStorage:', budgets.value);
  
  // Затем загружаем актуальные данные из БД
  if (currentUser.value?.token) {
    console.log('🔄 Loading fresh data from DB...');
    // Сначала категории, потом транзакции и бюджеты
    await loadCategoriesFromDB();
    await loadTransactionsFromDB(); 
    await loadBudgetsFromDB();
    
    console.log('🎯 Final budgets state:', budgets.value);
    console.log('👤 Final userBudgets:', userBudgets.value);
  } else {
    console.error('❌ No token on mount!');
  }
});
    return {
      // State
      currentUser,
      activeTab,
      showTransactionModal,
      showCategoryModal,
      showBudgetModal,
      editingCategory,

      // Forms
      transactionForm,
      categoryForm,
      budgetForm,

      // Computed
      userTransactions,
      userCategories,
      userBudgets,
      expenseCategories,
      sortedTransactions,
      totalIncome,
      totalExpenses,
      balance,

      // Methods
      switchTab,
      handleAddTransaction,
      handleAddCategory,
      handleSetBudget,
      editCategory,
      deleteCategory,
        openBudgetModal,
       deleteBudget,
      closeTransactionModal,
      closeCategoryModal,
      closeBudgetModal,
      getCategoryName,
      formatDate,
      getSpentInCategory,
      isOverBudget,
      getBudgetProgress,
      logout
    }
  }
}
</script>

<style scoped>
/* Стили уже подключены через глобальный styles.css */
</style>