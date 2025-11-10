let currentUser = null;

const authModal = document.getElementById("authModal");
const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authSubmit = document.getElementById("authSubmit");
const authSwitchText = document.getElementById("authSwitchText");
const confirmPasswordGroup = document.getElementById("confirmPasswordGroup");

document.addEventListener("DOMContentLoaded", async () => {
    loadData();
    console.log("Index.html loaded, currentUser:", currentUser);

    // Проверяем, находимся ли мы на index.html
    const isIndexPage = window.location.pathname.includes('index.html') || 
                        window.location.pathname === '/' || 
                        window.location.pathname.endsWith('/');

    // Редиректим на dashboard только если мы на index.html и пользователь авторизован
    if (currentUser && currentUser.token && isIndexPage) {
        console.log("User already authenticated, redirecting to dashboard");
        window.location.href = "dashboard.html";
        return;
    }

    // Только для index.html - показываем landing page
    if (isIndexPage) {
        setupEventListeners();
        showLanding();
    }
});

function loadData() {
    console.log("Loading user data from localStorage...");

    // Загружаем только пользователя
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
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
            currentUser = null;
            localStorage.removeItem("currentUser");
        }
    }
}

function setupEventListeners() {
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const getStartedBtn = document.getElementById("getStartedBtn");
    const closeModal = document.getElementById("closeModal");

    if (loginBtn) {
        loginBtn.addEventListener("click", () => openAuthModal("login"));
    }
    if (signupBtn) {
        signupBtn.addEventListener("click", () => openAuthModal("signup"));
    }
    if (getStartedBtn) {
        getStartedBtn.addEventListener("click", () => openAuthModal("signup"));
    }
    if (closeModal) {
        closeModal.addEventListener("click", closeAuthModal);
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

    // Закрытие модалки по клику вне контента
    window.addEventListener("click", (e) => {
        if (e.target === authModal) {
            closeAuthModal();
        }
    });
}

function showLanding() {
    console.log("showLanding called");
    const landing = document.getElementById("landing");
    if (landing) {
        landing.classList.add("active");
    }
    
    // Убедимся, что navbar виден
    const navbar = document.querySelector(".navbar");
    if (navbar) {
        navbar.style.display = "flex";
        navbar.classList.remove("hidden");
    }
    
    // Скрываем dashboard если он есть (на index.html его не должно быть)
    const dashboard = document.getElementById("dashboard");
    if (dashboard) {
        dashboard.classList.remove("active");
    }
}

function openAuthModal(mode) {
    if (!authModal) return;

    if (mode === "login") {
        authTitle.textContent = "Добро пожаловать";
        authSubmit.textContent = "Войти";
        authSwitchText.innerHTML = 'Нет аккаунта? <button type="button" id="authSwitchBtn">Зарегистрироваться</button>';
        confirmPasswordGroup.style.display = "none";
        if (document.getElementById("confirmPassword")) {
            document.getElementById("confirmPassword").required = false;
        }
    } else {
        authTitle.textContent = "Создать аккаунт";
        authSubmit.textContent = "Зарегистрироваться";
        authSwitchText.innerHTML = 'Уже есть аккаунт? <button type="button" id="authSwitchBtn">Войти</button>';
        confirmPasswordGroup.style.display = "block";
        if (document.getElementById("confirmPassword")) {
            document.getElementById("confirmPassword").required = true;
        }
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
    const isLogin = authSubmit.textContent === "Войти";
    openAuthModal(isLogin ? "signup" : "login");
}

async function handleAuth(e) {
    e.preventDefault();
    if (!authForm) return;

    const formData = new FormData(authForm);
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    const isLogin = authSubmit.textContent === "Войти";

    if (!isLogin && password !== confirmPassword) {
        alert("Пароли не совпадают!");
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

        if (!response.ok) {
            throw new Error(data.error || 'Authentication failed');
        }

        // Сохраняем пользователя
        currentUser = { 
            email: email,
            token: data.token,
            userId: data.userId || data.id
        };

        console.log("User authenticated:", currentUser);
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        
        closeAuthModal();
        
        // Редирект на dashboard
        console.log("Redirecting to dashboard...");
        window.location.href = "dashboard.html";

    } catch (error) {
        console.error('Authentication error:', error);
        alert(error.message || 'Ошибка аутентификации. Пожалуйста, попробуйте снова.');
    }
}

// Функция logout только для dashboard
function logout() {
    currentUser = null;
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}