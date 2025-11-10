// dashboard.js - только для dashboard.html
let currentUser = null;
let transactions = [];
let categories = [
    { id: 1, name: "Food & Dining", color: "#ef4444" },
];
let budgets = [];

const authModal = document.getElementById("authModal");
const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authSubmit = document.getElementById("authSubmit");
const authSwitchText = document.getElementById("authSwitchText");
const confirmPasswordGroup = document.getElementById("confirmPasswordGroup");

const transactionModal = document.getElementById("transactionModal");
const transactionForm = document.getElementById("transactionForm");
const categoryModal = document.getElementById("categoryModal");
const categoryForm = document.getElementById("categoryForm");
const budgetModal = document.getElementById("budgetModal");
const budgetForm = document.getElementById("budgetForm");

document.addEventListener("DOMContentLoaded", async () => {
    loadData();
    console.log("Index.html loaded, currentUser:", currentUser);

    // Проверяем, находимся ли мы на index.html (а не перенаправлены с dashboard)
    const isIndexPage = window.location.pathname.includes('index.html') || 
                        window.location.pathname === '/' || 
                        window.location.pathname.endsWith('/');

    // Редиректим на dashboard только если мы на index.html и пользователь авторизован
    if (currentUser && currentUser.token && isIndexPage) {
        console.log("User already authenticated, redirecting to dashboard");
        window.location.href = "dashboard.html";
        return;
    }

    setupEventListeners();
    showLanding();
});

function loadData() {
    console.log("Loading data from localStorage...");
    
    // Загружаем пользователя
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log("Loaded user:", currentUser);
            
            // Валидация структуры пользователя
            if (!currentUser || !currentUser.token || !currentUser.email) {
                console.log("Invalid user data structure, clearing...");
                currentUser = null;
                localStorage.removeItem("currentUser");
            } else {
                console.log("User is valid, token exists:", !!currentUser.token);
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
            currentUser = null;
            localStorage.removeItem("currentUser");
        }
    } else {
        console.log("No user found in localStorage");
    }

    // Загружаем остальные данные
    const savedTransactions = localStorage.getItem("budgetApp_transactions");
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    }

    const savedCategories = localStorage.getItem("budgetApp_categories");
    if (savedCategories) {
        categories = JSON.parse(savedCategories);
    }

    const savedBudgets = localStorage.getItem("budgetApp_budgets");
    if (savedBudgets) {
        budgets = JSON.parse(savedBudgets);
    }
}

function setupEventListeners() {
    // Проверяем существование элементов перед добавлением обработчиков
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    const closeModal = document.getElementById("closeModal");
    if (closeModal) {
        closeModal.addEventListener("click", closeAuthModal);
    }

    const closeTransactionModal = document.getElementById("closeTransactionModal");
    if (closeTransactionModal) {
        closeTransactionModal.addEventListener("click", closeTransactionModal);
    }

    const closeCategoryModal = document.getElementById("closeCategoryModal");
    if (closeCategoryModal) {
        closeCategoryModal.addEventListener("click", closeCategoryModal);
    }

    const closeBudgetModal = document.getElementById("closeBudgetModal");
    if (closeBudgetModal) {
        closeBudgetModal.addEventListener("click", closeBudgetModal);
    }

    if (authForm) {
        authForm.addEventListener("submit", handleAuth);
    }

    // Обработчик для кнопки переключения режима
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'authSwitchBtn') {
            toggleAuthMode();
        }
    });

    if (transactionForm) {
        transactionForm.addEventListener("submit", handleAddTransaction);
    }

    const addTransactionBtn = document.getElementById("addTransactionBtn");
    if (addTransactionBtn) {
        addTransactionBtn.addEventListener("click", openTransactionModal);
    }

    if (categoryForm) {
        categoryForm.addEventListener("submit", handleAddCategory);
    }

    const addCategoryBtn = document.getElementById("addCategoryBtn");
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener("click", openCategoryModal);
    }

    if (budgetForm) {
        budgetForm.addEventListener("submit", handleSetBudget);
    }

    const setBudgetBtn = document.getElementById("setBudgetBtn");
    if (setBudgetBtn) {
        setBudgetBtn.addEventListener("click", openBudgetModal);
    }

    // Табы
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const tabName = e.target.getAttribute("data-tab");
            switchTab(tabName);
        });
    });

    // Закрытие модалок по клику вне контента
    window.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal")) {
            e.target.classList.remove("active");
        }
    });

    // Установка даты по умолчанию для транзакции
    const transactionDate = document.getElementById("transactionDate");
    if (transactionDate) {
        transactionDate.valueAsDate = new Date();
    }
}

function showDashboard() {
    console.log("showDashboard called");
    
    // Прячем auth modal если открыт
    if (authModal) {
        authModal.classList.remove("active");
    }
    
    // Показываем dashboard контент
    const dashboard = document.getElementById("dashboard");
    if (dashboard) {
        dashboard.classList.add("active");
    }
    
    if (currentUser) {
        const userEmail = document.getElementById("userEmail");
        if (userEmail) {
            userEmail.textContent = currentUser.email;
        }
    }
    
    updateDashboard();
    renderTransactions();
    renderCategories();
    renderBudgets();
}

function logout() {
    currentUser = null;
    localStorage.removeItem("currentUser");
    localStorage.removeItem("budgetApp_transactions");
    localStorage.removeItem("budgetApp_categories");
    localStorage.removeItem("budgetApp_budgets");
    window.location.href = "index.html";
}

function openAuthModal(mode) {
    if (!authModal) return;

    if (mode === "login") {
        authTitle.textContent = "Welcome Back";
        authSubmit.textContent = "Sign In";
        authSwitchText.innerHTML = 'Don\'t have an account? <button type="button" id="authSwitchBtn">Sign up</button>';
        confirmPasswordGroup.style.display = "none";
        document.getElementById("confirmPassword").required = false;
    } else {
        authTitle.textContent = "Create Account";
        authSubmit.textContent = "Sign Up";
        authSwitchText.innerHTML = 'Already have an account? <button type="button" id="authSwitchBtn">Sign in</button>';
        confirmPasswordGroup.style.display = "block";
        document.getElementById("confirmPassword").required = true;
    }

    authModal.classList.add("active");
}

function closeAuthModal() {
    if (authModal) {
        authModal.classList.remove("active");
    }
    if (authForm) {
        authForm.reset();
    }
}

function toggleAuthMode() {
    const isLogin = authSubmit.textContent === "Sign In";
    openAuthModal(isLogin ? "signup" : "login");
}

async function handleAuth(e) {
    e.preventDefault();

    const formData = new FormData(authForm);
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    const isLogin = authSubmit.textContent === "Sign In";

    if (!isLogin && password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
        const body = isLogin ? { email, password } : { username: email, email, password };

        console.log("Sending auth request to:", endpoint);
        
        const response = await fetch(`http://localhost:5000${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        console.log("Auth response:", data);

        if (!response.ok) {
            throw new Error(data.error || 'Authentication failed');
        }

        currentUser = { 
            email: email,
            token: data.token,
            userId: data.userId || data.id
        };

        console.log("Setting currentUser:", currentUser);
        
        // Сохраняем пользователя
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        
        // Закрываем модалку
        closeAuthModal();
        
        // ОБНОВЛЯЕМ интерфейс вместо редиректа
        await loadCategoriesFromDB();
        updateCategoryDropdowns();
        showDashboard();
        
        console.log("Auth successful, dashboard updated");

    } catch (error) {
        console.error('Authentication error:', error);
        alert(error.message || 'Authentication failed. Please try again.');
    }
}

function switchTab(tabName) {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.remove("active");
    });
    
    const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTabBtn) {
        activeTabBtn.classList.add("active");
    }

    document.querySelectorAll(".tab-pane").forEach((pane) => {
        pane.classList.remove("active");
    });
    
    const activeTabPane = document.getElementById(tabName);
    if (activeTabPane) {
        activeTabPane.classList.add("active");
    }
}

function openTransactionModal() {
    if (transactionModal) {
        transactionModal.classList.add("active");
    }
}

function closeTransactionModal() {
    if (transactionModal) {
        transactionModal.classList.remove("active");
    }
    if (transactionForm) {
        transactionForm.reset();
    }
    
    const transactionDate = document.getElementById("transactionDate");
    if (transactionDate) {
        transactionDate.valueAsDate = new Date();
    }
}

function handleAddTransaction(e) {
    e.preventDefault();

    const formData = new FormData(transactionForm);
    const transaction = {
        id: Date.now(),
        type: formData.get("type"),
        amount: Number.parseFloat(formData.get("amount")),
        category: formData.get("category"),
        description: formData.get("description"),
        date: formData.get("date"),
        userId: currentUser.email,
    };

    transactions.push(transaction);
    saveData();

    closeTransactionModal();
    updateDashboard();
    renderTransactions();
}

function renderTransactions() {
    const transactionsList = document.getElementById("transactionsList");
    if (!transactionsList) return;

    if (transactions.length === 0) {
        transactionsList.innerHTML =
            '<div class="empty-state"><p>No transactions yet. Add your first transaction to get started!</p></div>';
        return;
    }

    const userTransactions = transactions.filter((t) => t.userId === currentUser.email);

    if (userTransactions.length === 0) {
        transactionsList.innerHTML =
            '<div class="empty-state"><p>No transactions yet. Add your first transaction to get started!</p></div>';
        return;
    }

    transactionsList.innerHTML = userTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((transaction) => {
            const category = categories.find((c) => c.id == transaction.category);
            return `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-description">${transaction.description}</div>
                        <div class="transaction-category">${category ? category.name : "Unknown"} • ${new Date(transaction.date).toLocaleDateString()}</div>
                    </div>
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === "income" ? "+" : "-"}$${transaction.amount.toFixed(2)}
                    </div>
                </div>
            `;
        })
        .join("");
}

function openCategoryModal() {
    if (categoryModal) {
        categoryModal.classList.add("active");
    }
}

function closeCategoryModal() {
    if (categoryModal) {
        categoryModal.classList.remove("active");
    }
    if (categoryForm) {
        categoryForm.reset();
    }
}

async function handleAddCategory(e) {
    e.preventDefault();

    const formData = new FormData(categoryForm);
    const categoryData = {
        name: formData.get("name"),
        color: formData.get("color"),
        type: formData.get("type") || "expense"
    };

    try {
        if (!currentUser || !currentUser.token) {
            alert('Пожалуйста, войдите в систему');
            return;
        }

        if (!categoryData.name.trim()) {
            alert('Введите название категории');
            return;
        }

        if (!categoryData.color) {
            alert('Выберите цвет для категории');
            return;
        }

        console.log('Creating category:', categoryData);

        const response = await fetch('http://localhost:5000/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(categoryData)
        });

        console.log('Create category response status:', response.status);

        if (response.status === 401) {
            alert('Сессия истекла. Пожалуйста, войдите снова.');
            logout();
            return;
        }

        if (response.status === 400) {
            const errorData = await response.json();
            alert(errorData.error || 'Ошибка при создании категории');
            return;
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Category created:', data);

        const category = {
            id: data.id,
            name: data.name,
            color: data.color,
            type: data.type,
            user_id: data.user_id
        };

        categories.push(category);
        saveData();

        closeCategoryModal();
        updateCategoryDropdowns();
        renderCategories();
        
        alert('Категория успешно создана!');

    } catch (error) {
        console.error('Error creating category:', error);
        alert('Ошибка при создании категории. Проверьте подключение к серверу.');
    }
}

// загрузка категорий с бд 
// загрузка категорий с бд 
async function loadCategoriesFromDB() {
    try {
        if (!currentUser || !currentUser.token) {
            console.log('User not authenticated');
            return;
        }

        console.log('Loading categories from DB with token:', currentUser.token);

        const response = await fetch('http://localhost:5000/api/categories', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentUser.token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Categories response status:', response.status);

        if (response.status === 401) {
            console.log('Token expired, logging out');
            logout();
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Categories data received:', data);
        
        // Сохраняем категории
        categories = data.map(cat => ({
            id: cat.id,
            name: cat.name,
            color: cat.color || '#3b82f6',
            type: cat.type || 'expense',
            user_id: cat.user_id
        }));

        console.log('Processed categories:', categories);

        saveData();
        updateCategoryDropdowns();
        renderCategories();

    } catch (error) {
        console.error('Error loading categories:', error);
        console.log('Using local categories data');
        // В случае ошибки используем локальные данные
        updateCategoryDropdowns();
        renderCategories();
    }
}

// удаление категории с бд
// удаление категории с бд
async function deleteCategory(categoryId) {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) {
        return;
    }

    try {
        if (!currentUser || !currentUser.token) {
            alert('Пожалуйста, войдите в систему');
            return;
        }

        console.log('Deleting category:', categoryId);

        const response = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentUser.token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Delete category response status:', response.status);

        if (response.status === 401) {
            alert('Сессия истекла. Пожалуйста, войдите снова.');
            logout();
            return;
        }

        if (response.status === 400) {
            const errorData = await response.json();
            alert(errorData.error || 'Нельзя удалить категорию');
            return;
        }

        if (response.status === 404) {
            alert('Категория не найдена');
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Удаляем категорию из локального массива
        categories = categories.filter(cat => cat.id !== categoryId);
        saveData();
        updateCategoryDropdowns();
        renderCategories();
        
        alert('Категория успешно удалена!');

    } catch (error) {
        console.error('Error deleting category:', error);
        alert('Ошибка при удалении категории: ' + error.message);
    }
}

// функция для открытия модалки редактирования категории
function editCategory(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) {
        alert('Категория не найдена');
        return;
    }

    // Заполняем форму данными категории
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryType').value = category.type;
    document.getElementById('categoryColor').value = category.color;

    // Меняем обработчик формы на обновление
    categoryForm.onsubmit = async function(e) {
        e.preventDefault();
        const formData = new FormData(categoryForm);
        const updatedData = {
            name: formData.get("name"),
            color: formData.get("color"),
            type: formData.get("type") || "expense"
        };
        
        await updateCategory(categoryId, updatedData);
        closeCategoryModal();
        
        // Возвращаем оригинальный обработчик
        categoryForm.onsubmit = handleAddCategory;
    };

    openCategoryModal();
}


function renderCategories() {
    const categoriesGrid = document.getElementById("categoriesGrid");
    if (!categoriesGrid) return;

    const userCategories = categories.filter(cat => 
        cat.user_id === currentUser?.userId || 
        (currentUser?.userId === undefined && cat.user_id === undefined)
    );

    if (userCategories.length === 0) {
        categoriesGrid.innerHTML = `
            <div class="empty-state">
                <p>Нет категорий. Создайте первую категорию для организации транзакций!</p>
            </div>
        `;
        return;
    }

    categoriesGrid.innerHTML = userCategories
        .map((category) => `
            <div class="category-item">
                <div class="category-color" style="background-color: ${category.color}"></div>
                <div class="category-info">
                    <div class="category-name">${category.name}</div>
                    <div class="category-type">${category.type === 'income' ? 'Доход' : 'Расход'}</div>
                </div>
                <div class="category-actions">
                    <button class="btn secondary btn-sm" onclick="editCategory(${category.id})">
                        Редактировать
                    </button>
                    <button class="btn danger btn-sm" onclick="deleteCategory(${category.id})">
                        Удалить
                    </button>
                </div>
            </div>
        `)
        .join("");
}

// обновление категории
async function updateCategory(categoryId, updatedData) {
    try {
        if (!currentUser || !currentUser.token) {
            alert('Пожалуйста, войдите в систему');
            return;
        }

        console.log('Updating category:', categoryId, updatedData);

        const response = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(updatedData)
        });

        console.log('Update category response status:', response.status);

        if (response.status === 401) {
            alert('Сессия истекла. Пожалуйста, войдите снова.');
            logout();
            return;
        }

        if (response.status === 400) {
            const errorData = await response.json();
            alert(errorData.error || 'Ошибка при обновлении категории');
            return;
        }

        if (response.status === 404) {
            alert('Категория не найдена');
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Category updated:', data);

        // Обновляем локальную категорию
        const index = categories.findIndex(cat => cat.id === categoryId);
        if (index !== -1) {
            categories[index] = {
                id: data.id,
                name: data.name,
                color: data.color,
                type: data.type,
                user_id: data.user_id
            };
            saveData();
            updateCategoryDropdowns();
            renderCategories();
        }

        alert('Категория успешно обновлена!');

    } catch (error) {
        console.error('Error updating category:', error);
        alert('Ошибка при обновлении категории: ' + error.message);
    }
}

function openBudgetModal() {
    if (budgetModal) {
        budgetModal.classList.add("active");
    }
}

function closeBudgetModal() {
    if (budgetModal) {
        budgetModal.classList.remove("active");
    }
    if (budgetForm) {
        budgetForm.reset();
    }
}

function handleSetBudget(e) {
    e.preventDefault();

    const formData = new FormData(budgetForm);
    const budget = {
        id: Date.now(),
        categoryId: Number.parseInt(formData.get("category")),
        amount: Number.parseFloat(formData.get("amount")),
        userId: currentUser.email,
    };

    budgets = budgets.filter((b) => !(b.categoryId === budget.categoryId && b.userId === budget.userId));

    budgets.push(budget);
    saveData();

    closeBudgetModal();
    renderBudgets();
}

function renderBudgets() {
    const budgetOverview = document.getElementById("budgetOverview");
    if (!budgetOverview) return;

    const userBudgets = budgets.filter((b) => b.userId === currentUser.email);

    if (userBudgets.length === 0) {
        budgetOverview.innerHTML =
            '<div class="empty-state"><p>Set up your first budget to start tracking your spending goals!</p></div>';
        return;
    }

    budgetOverview.innerHTML = userBudgets
        .map((budget) => {
            const category = categories.find((c) => c.id === budget.categoryId);
            const spent = getSpentInCategory(budget.categoryId);
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            const isOverBudget = spent > budget.amount;

            return `
                <div class="budget-item">
                    <div class="budget-header">
                        <h3>${category ? category.name : "Unknown Category"}</h3>
                        <div>
                            <span class="${isOverBudget ? "text-error" : "text-success"}">$${spent.toFixed(2)}</span>
                            <span class="text-muted"> / $${budget.amount.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="budget-progress">
                        <div class="budget-progress-bar ${isOverBudget ? "over-budget" : ""}" 
                             style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        })
        .join("");
}

function getSpentInCategory(categoryId) {
    const userTransactions = transactions.filter((t) => t.userId === currentUser.email);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return userTransactions
        .filter((t) => {
            const transactionDate = new Date(t.date);
            return (
                t.type === "expense" &&
                t.category == categoryId &&
                transactionDate.getMonth() === currentMonth &&
                transactionDate.getFullYear() === currentYear
            );
        })
        .reduce((sum, t) => sum + t.amount, 0);
}

function updateDashboard() {
    if (!currentUser) return;

    const userTransactions = transactions.filter((t) => t.userId === currentUser.email);

    const totalIncome = userTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = userTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    const totalIncomeElement = document.getElementById("totalIncome");
    const totalExpensesElement = document.getElementById("totalExpenses");
    const balanceElement = document.getElementById("balance");

    if (totalIncomeElement) {
        totalIncomeElement.textContent = `$${totalIncome.toFixed(2)}`;
    }
    
    if (totalExpensesElement) {
        totalExpensesElement.textContent = `$${totalExpenses.toFixed(2)}`;
    }
    
    if (balanceElement) {
        balanceElement.textContent = `$${balance.toFixed(2)}`;
        
        if (balance >= 0) {
            balanceElement.className = "stat-value text-success";
        } else {
            balanceElement.className = "stat-value text-error";
        }
    }
}

function saveData() {
    localStorage.setItem("budgetApp_transactions", JSON.stringify(transactions));
    localStorage.setItem("budgetApp_categories", JSON.stringify(categories));
    localStorage.setItem("budgetApp_budgets", JSON.stringify(budgets));
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function addSampleData() {
    if (transactions.length === 0 && currentUser) {
        const sampleTransactions = [
            {
                id: 1,
                type: "expense",
                amount: 25,
                category: 2,
                description: "Gas",
                date: "2024-01-03",
                userId: currentUser.email,
            },
        ];

        transactions.push(...sampleTransactions);
        saveData();
        updateDashboard();
        renderTransactions();
    }
}