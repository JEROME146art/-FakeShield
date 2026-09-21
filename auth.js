// ===================================================================
// FakeShield - Client Authentication & User Profile Manager
// ===================================================================

const AUTH_STORAGE_KEY = 'fakeshield_users_db';
const SESSION_STORAGE_KEY = 'fakeshield_auth_user';

// Multi-language strings for Auth Pages
const AUTH_I18N = {
    en: {
        loginTitle: "Welcome back! Login to continue",
        signupTitle: "Create your account for AI verification",
        lblUsername: "Username or Email",
        lblPassword: "Password",
        lblFullName: "Full Name",
        lblConfirmPassword: "Confirm Password",
        lblRole: "Your Role / Organization",
        roleUser: "General User / Reader",
        roleChecker: "Fact Checker / Analyst",
        roleJournalist: "Journalist / Reporter",
        roleResearcher: "Academic Researcher",
        btnLogin: "🚀 Login to FakeShield",
        btnSignup: "✨ Create Account",
        orDivider: "OR QUICK DEMO",
        demoAnalyst: "🛡️ Demo Fact-Checker",
        demoUser: "👤 Demo Regular User",
        btnGuest: "⚡ Continue as Guest (No Login)",
        noAccount: "Don't have an account?",
        haveAccount: "Already have an account?",
        linkSignup: "Sign up here",
        linkLogin: "Login here",
        rememberMe: "Remember me",
        msgLoginSuccess: "✅ Login successful! Redirecting...",
        msgSignupSuccess: "✅ Account created successfully! Logging you in...",
        errEmpty: "Please fill in all required fields.",
        errPasswordMatch: "Passwords do not match.",
        errUserExists: "A user with this username or email already exists.",
        errInvalidCreds: "Invalid username or password."
    },
    ta: {
        loginTitle: "மீண்டும் வருக! தொடர உள்நுழையவும்",
        signupTitle: "AI சரிபார்ப்பிற்கு கணக்கை உருவாக்கவும்",
        lblUsername: "பயனர் பெயர் அல்லது மின்னஞ்சல்",
        lblPassword: "கடவுச்சொல்",
        lblFullName: "முழு பெயர்",
        lblConfirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
        lblRole: "உங்கள் பங்கு / துறை",
        roleUser: "பொது பயனர் / வாசகர்",
        roleChecker: "உண்மை சரிபார்ப்பாளர்",
        roleJournalist: "செய்தியாளர் / நிருபர்",
        roleResearcher: "ஆராய்ச்சியாளர்",
        btnLogin: "🚀 உள்நுழையவும்",
        btnSignup: "✨ கணக்கு தொடங்கவும்",
        orDivider: "அல்லது மாதிரி பயனர்",
        demoAnalyst: "🛡️ உண்மை சரிபார்ப்பாளர்",
        demoUser: "👤 மாதிரி பயனர்",
        btnGuest: "⚡ விருந்தினராக தொடரவும் (உள்நுழைவு இன்றி)",
        noAccount: "கணக்கு இல்லையா?",
        haveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
        linkSignup: "இங்கே பதிவு செய்யுங்கள்",
        linkLogin: "இங்கே உள்நுழையவும்",
        rememberMe: "என்னை நினைவில் கொள்",
        msgLoginSuccess: "✅ உள்நுழைவு வெற்றி! வழிமாற்றப்படுகிறது...",
        msgSignupSuccess: "✅ கணக்கு உருவாக்கப்பட்டது! உள்நுழைகிறது...",
        errEmpty: "அனைத்து விவரங்களையும் நிரப்பவும்.",
        errPasswordMatch: "கடவுச்சொற்கள் பொருந்தவில்லை.",
        errUserExists: "இந்த பயனர் பெயர் ஏற்கனவே உள்ளது.",
        errInvalidCreds: "தவறான பயனர் பெயர் அல்லது கடவுச்சொல்."
    },
    hi: {
        loginTitle: "वापसी पर स्वागत है! जारी रखने के लिए लॉगिन करें",
        signupTitle: "AI सत्यापन के लिए खाता बनाएं",
        lblUsername: "उपयोगकर्ता नाम या ईमेल",
        lblPassword: "पासवर्ड",
        lblFullName: "पूरा नाम",
        lblConfirmPassword: "पासवर्ड की पुष्टि करें",
        lblRole: "आपकी भूमिका",
        roleUser: "सामान्य पाठक",
        roleChecker: "तथ्य जाँचकर्ता (Fact Checker)",
        roleJournalist: "पत्रकार",
        roleResearcher: "शोधकर्ता",
        btnLogin: "🚀 लॉगिन करें",
        btnSignup: "✨ खाता बनाएं",
        orDivider: "या डेमो लॉगिन",
        demoAnalyst: "🛡️ डेमो विश्लेषक",
        demoUser: "👤 डेमो उपयोगकर्ता",
        btnGuest: "⚡ अतिथि के रूप में जारी रखें",
        noAccount: "खाता नहीं है?",
        haveAccount: "पहले से खाता है?",
        linkSignup: "यहाँ साइन अप करें",
        linkLogin: "यहाँ लॉगिन करें",
        rememberMe: "मुझे याद रखें",
        msgLoginSuccess: "✅ लॉगिन सफल! पुनः निर्देशित किया जा रहा है...",
        msgSignupSuccess: "✅ खाता सफलतापूर्वक बन गया!",
        errEmpty: "कृपया सभी फ़ील्ड भरें।",
        errPasswordMatch: "पासवर्ड मेल नहीं खाते।",
        errUserExists: "यह उपयोगकर्ता नाम पहले से मौजूद है।",
        errInvalidCreds: "अमान्य उपयोगकर्ता नाम या पासवर्ड।"
    },
    es: {
        loginTitle: "¡Bienvenido! Inicia sesión para continuar",
        signupTitle: "Crea tu cuenta para la verificación por IA",
        lblUsername: "Usuario o Correo Electrónico",
        lblPassword: "Contraseña",
        lblFullName: "Nombre Completo",
        lblConfirmPassword: "Confirmar Contraseña",
        lblRole: "Tu Rol / Ocupación",
        roleUser: "Usuario General",
        roleChecker: "Verificador de Hechos",
        roleJournalist: "Periodista",
        roleResearcher: "Investigador Académico",
        btnLogin: "🚀 Iniciar Sesión",
        btnSignup: "✨ Crear Cuenta",
        orDivider: "O DEMO RÁPIDO",
        demoAnalyst: "🛡️ Verificador Demo",
        demoUser: "👤 Usuario Demo",
        btnGuest: "⚡ Continuar como Invitado",
        noAccount: "¿No tienes cuenta?",
        haveAccount: "¿Ya tienes cuenta?",
        linkSignup: "Regístrate aquí",
        linkLogin: "Inicia sesión aquí",
        rememberMe: "Recordarme",
        msgLoginSuccess: "✅ ¡Inicio de sesión exitoso!",
        msgSignupSuccess: "✅ ¡Cuenta creada exitosamente!",
        errEmpty: "Por favor completa todos los campos.",
        errPasswordMatch: "Las contraseñas no coinciden.",
        errUserExists: "El usuario o correo ya existe.",
        errInvalidCreds: "Usuario o contraseña incorrectos."
    },
    fr: {
        loginTitle: "Bon retour ! Connectez-vous pour continuer",
        signupTitle: "Créez votre compte de vérification IA",
        lblUsername: "Nom d'utilisateur ou Email",
        lblPassword: "Mot de passe",
        lblFullName: "Nom Complet",
        lblConfirmPassword: "Confirmer le mot de passe",
        lblRole: "Votre Rôle",
        roleUser: "Utilisateur Général",
        roleChecker: "Vérificateur de Faits",
        roleJournalist: "Journaliste",
        roleResearcher: "Chercheur",
        btnLogin: "🚀 Se Connecter",
        btnSignup: "✨ Créer un Compte",
        orDivider: "OU DÉMO RAPIDE",
        demoAnalyst: "🛡️ Démo Vérificateur",
        demoUser: "👤 Démo Utilisateur",
        btnGuest: "⚡ Continuer comme Invité",
        noAccount: "Pas de compte ?",
        haveAccount: "Vous avez déjà un compte ?",
        linkSignup: "Inscrivez-vous ici",
        linkLogin: "Connectez-vous ici",
        rememberMe: "Se souvenir de moi",
        msgLoginSuccess: "✅ Connexion réussie !",
        msgSignupSuccess: "✅ Compte créé avec succès !",
        errEmpty: "Veuillez remplir tous les champs.",
        errPasswordMatch: "Les mots de passe ne correspondent pas.",
        errUserExists: "L'utilisateur ou l'email existe déjà.",
        errInvalidCreds: "Identifiants incorrects."
    },
    de: {
        loginTitle: "Willkommen zurück! Bitte einloggen",
        signupTitle: "Erstellen Sie Ihr Konto für die KI-Prüfung",
        lblUsername: "Benutzername oder E-Mail",
        lblPassword: "Passwort",
        lblFullName: "Vollständiger Name",
        lblConfirmPassword: "Passwort bestätigen",
        lblRole: "Ihre Rolle",
        roleUser: "Allgemeiner Benutzer",
        roleChecker: "Faktenchecker",
        roleJournalist: "Journalist",
        roleResearcher: "Forscher",
        btnLogin: "🚀 Anmelden",
        btnSignup: "✨ Konto Erstellen",
        orDivider: "ODER SCHNELL-DEMO",
        demoAnalyst: "🛡️ Demo Faktenchecker",
        demoUser: "👤 Demo Benutzer",
        btnGuest: "⚡ Als Gast fortfahren",
        noAccount: "Noch kein Konto?",
        haveAccount: "Bereits registriert?",
        linkSignup: "Hier registrieren",
        linkLogin: "Hier anmelden",
        rememberMe: "Angemeldet bleiben",
        msgLoginSuccess: "✅ Anmeldung erfolgreich!",
        msgSignupSuccess: "✅ Konto erfolgreich erstellt!",
        errEmpty: "Bitte alle Felder ausfüllen.",
        errPasswordMatch: "Passwörter stimmen nicht überein.",
        errUserExists: "Benutzername oder E-Mail existiert bereits.",
        errInvalidCreds: "Ungültiger Benutzername oder Passwort."
    }
};

// --- Storage & Account Helpers ---
function getUsersDB() {
    try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.error('Error reading users DB:', e);
    }
    // Default seed users for easy demo
    const defaultDB = [
        {
            id: 'usr_1',
            fullName: 'Jerome FactChecker',
            username: 'jerome',
            email: 'jerome@fakeshield.ai',
            password: 'password123',
            role: 'Fact Checker / Analyst',
            createdAt: new Date().toISOString()
        },
        {
            id: 'usr_2',
            fullName: 'Demo Analyst',
            username: 'analyst',
            email: 'analyst@fakeshield.ai',
            password: 'demo',
            role: 'Fact Checker / Analyst',
            createdAt: new Date().toISOString()
        }
    ];
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultDB));
    return defaultDB;
}

function saveUsersDB(db) {
    try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
        console.error('Error saving users DB:', e);
    }
}

function getCurrentAuthUser() {
    try {
        const session = localStorage.getItem(SESSION_STORAGE_KEY);
        if (session) return JSON.parse(session);
    } catch (e) {
        console.error('Error getting session user:', e);
    }
    return null;
}

function setCurrentAuthUser(user) {
    if (user) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
    }
}

function logoutUser() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    window.location.href = 'index.html';
}

// --- Toggle Password Visibility ---
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        if (btn) btn.innerText = '🙈';
    } else {
        input.type = 'password';
        if (btn) btn.innerText = '👁️';
    }
}

// --- Display Alerts ---
function showAuthAlert(msg, type = 'error') {
    const alertBox = document.getElementById('authAlert');
    if (!alertBox) return;
    alertBox.className = `auth-alert ${type}`;
    alertBox.innerHTML = `<span>${msg}</span>`;
    alertBox.style.display = 'flex';
}

// --- Auth Action Handlers ---
function handleLoginSubmit(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('usernameOrEmail').value.trim();
    const passwordInput = document.getElementById('password').value;
    const lang = localStorage.getItem('fakeshield_lang') || 'en';
    const dict = AUTH_I18N[lang] || AUTH_I18N.en;

    if (!usernameInput || !passwordInput) {
        showAuthAlert(dict.errEmpty, 'error');
        return;
    }

    const users = getUsersDB();
    const user = users.find(u => 
        (u.username.toLowerCase() === usernameInput.toLowerCase() || u.email.toLowerCase() === usernameInput.toLowerCase()) &&
        u.password === passwordInput
    );

    if (user) {
        const sessionData = {
            id: user.id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            role: user.role,
            loginTime: new Date().toISOString()
        };
        setCurrentAuthUser(sessionData);
        showAuthAlert(dict.msgLoginSuccess, 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 800);
    } else {
        showAuthAlert(dict.errInvalidCreds, 'error');
    }
}

function handleSignupSubmit(event) {
    event.preventDefault();
    const fullName = document.getElementById('fullName').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const lang = localStorage.getItem('fakeshield_lang') || 'en';
    const dict = AUTH_I18N[lang] || AUTH_I18N.en;

    if (!fullName || !username || !email || !password || !confirmPassword) {
        showAuthAlert(dict.errEmpty, 'error');
        return;
    }

    if (password !== confirmPassword) {
        showAuthAlert(dict.errPasswordMatch, 'error');
        return;
    }

    const users = getUsersDB();
    const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase());

    if (exists) {
        showAuthAlert(dict.errUserExists, 'error');
        return;
    }

    const newUser = {
        id: 'usr_' + Date.now(),
        fullName,
        username,
        email,
        role: role || 'General User',
        password,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsersDB(users);

    const sessionData = {
        id: newUser.id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        loginTime: new Date().toISOString()
    };
    setCurrentAuthUser(sessionData);

    showAuthAlert(dict.msgSignupSuccess, 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 900);
}

// Quick Demo Login
function quickDemoLogin(roleType) {
    const isAnalyst = roleType === 'analyst';
    const sessionData = {
        id: isAnalyst ? 'usr_analyst' : 'usr_reader',
        fullName: isAnalyst ? 'Jerome (Lead Fact-Checker)' : 'Alex User (Public)',
        username: isAnalyst ? 'jerome_analyst' : 'alex_reader',
        email: isAnalyst ? 'analyst@fakeshield.ai' : 'alex@example.com',
        role: isAnalyst ? 'Fact Checker / Analyst' : 'General User',
        loginTime: new Date().toISOString()
    };
    setCurrentAuthUser(sessionData);
    const lang = localStorage.getItem('fakeshield_lang') || 'en';
    const dict = AUTH_I18N[lang] || AUTH_I18N.en;
    showAuthAlert(dict.msgLoginSuccess, 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 600);
}

// Guest Mode
function continueAsGuest() {
    window.location.href = 'index.html';
}

// Apply Language to Auth Form
function applyAuthLanguage(langCode) {
    const dict = AUTH_I18N[langCode] || AUTH_I18N.en;
    localStorage.setItem('fakeshield_lang', langCode);

    const elSub = document.getElementById('authSubtitle');
    if (elSub) {
        const isSignup = window.location.pathname.includes('signup');
        elSub.innerText = isSignup ? dict.signupTitle : dict.loginTitle;
    }

    const map = {
        lblUsernameText: dict.lblUsername,
        lblPasswordText: dict.lblPassword,
        lblFullNameText: dict.lblFullName,
        lblConfirmPasswordText: dict.lblConfirmPassword,
        lblRoleText: dict.lblRole,
        btnLoginText: dict.btnLogin,
        btnSignupText: dict.btnSignup,
        orDividerText: dict.orDivider,
        demoAnalystText: dict.demoAnalyst,
        demoUserText: dict.demoUser,
        btnGuestText: dict.btnGuest,
        noAccountText: dict.noAccount,
        haveAccountText: dict.haveAccount,
        linkSignupText: dict.linkSignup,
        linkLoginText: dict.linkLogin,
        rememberMeText: dict.rememberMe
    };

    Object.entries(map).forEach(([id, text]) => {
        const el = document.getElementById(id);
        if (el && text) el.innerText = text;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('fakeshield_lang') || 'en';
    const langSelect = document.getElementById('authLangSelect');
    if (langSelect) {
        langSelect.value = savedLang;
        langSelect.addEventListener('change', (e) => applyAuthLanguage(e.target.value));
    }
    applyAuthLanguage(savedLang);
});
