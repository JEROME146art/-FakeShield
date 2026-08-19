// FakeShield Frontend App
const API_BASE_URL = '/api';
let selectedImage = null;

// ================================
// User Authentication
// ================================

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function isLoggedIn() {
    return !!getToken();
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
}

// Add token to fetch requests
function authFetch(url, options = {}) {
    const token = getToken();
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }
    return fetch(url, options);
}

// ================================
// Initialize User Menu on Page Load
// ================================

document.addEventListener('DOMContentLoaded', () => {
    initUserMenu();
});

function initUserMenu() {
    const user = getUser();
    const navRight = document.querySelector('nav > div:last-child') || document.querySelector('.nav-right');

    if (!navRight) return;

    if (user) {
        // Show user avatar
        const initials = user.fullName
            ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            : user.username.substring(0, 2).toUpperCase();

        const userMenuHTML = `
            <div class="user-menu">
                <div class="user-avatar" onclick="toggleUserMenu()">${initials}</div>
                <div class="user-dropdown" id="userDropdown">
                    <div class="user-info">
                        <div class="user-name">${user.fullName || user.username}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                    <a href="/history.html">📜 My History</a>
                    <a href="/profile.html">👤 Profile</a>
                    <a href="#" onclick="logout(); return false;" class="logout-btn">🚪 Logout</a>
                </div>
            </div>
        `;

        // Insert user menu (adjust selector based on your nav structure)
        navRight.insertAdjacentHTML('beforeend', userMenuHTML);
    } else {
        // Show login button
        const loginHTML = `
            <a href="/login.html" style="color: white; text-decoration: none; padding: 8px 20px; 
               background: linear-gradient(135deg, #00f2fe, #a855f7); border-radius: 8px; 
               font-weight: 600; margin-left: 12px;">
                Login
            </a>
        `;
        navRight.insertAdjacentHTML('beforeend', loginHTML);
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.classList.remove('active');
    }
});
// ================================
// Tab Switching - FIXED
// ================================
function switchTab(tabName, buttonElement) {
    console.log('Switching to tab:', tabName);

    // Hide all tab contents
    const allTabs = document.querySelectorAll('.tab-content');
    for (let i = 0; i < allTabs.length; i++) {
        allTabs[i].classList.remove('active');
    }

    // Remove active from all buttons
    const allBtns = document.querySelectorAll('.tab-btn');
    for (let i = 0; i < allBtns.length; i++) {
        allBtns[i].classList.remove('active');
    }

    // Show selected tab
    const tabContent = document.getElementById('tab-' + tabName);
    if (tabContent) {
        tabContent.classList.add('active');
    }

    // Highlight the clicked button
    if (buttonElement) {
        buttonElement.classList.add('active');
    } else {
        // Fallback - find button by tab name
        const btnMap = {
            'text': 0,
            'url': 1,
            'image': 2
        };
        const btnIndex = btnMap[tabName];
        if (btnIndex !== undefined && allBtns[btnIndex]) {
            allBtns[btnIndex].classList.add('active');
        }
    }

    // Hide result card
    const resultCard = document.getElementById('resultCard');
    if (resultCard) {
        resultCard.style.display = 'none';
    }
}

// ================================
// Analyze Text
// ================================
async function analyzeNews() {
    const title = document.getElementById('newsTitle').value.trim();
    const content = document.getElementById('newsContent').value.trim();
    const sourceUrl = document.getElementById('sourceUrl').value.trim();
    const platform = document.getElementById('platform').value;

    if (!title) {
        alert('⚠️ Please enter a news headline');
        return;
    }

    document.getElementById('btnText').style.display = 'none';
    document.getElementById('btnLoader').style.display = 'flex';
    document.getElementById('btnAnalyze').disabled = true;
    document.getElementById('resultCard').style.display = 'none';

    try {
        const response = await fetch(API_BASE_URL + '/news/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, sourceUrl, platform })
        });

        if (!response.ok) throw new Error('Analysis failed');

        const data = await response.json();
        console.log('Result:', data);
        displayResults(data);

    } catch (error) {
        console.error('Error:', error);
        alert('❌ ' + error.message);
    } finally {
        document.getElementById('btnText').style.display = 'flex';
        document.getElementById('btnLoader').style.display = 'none';
        document.getElementById('btnAnalyze').disabled = false;
    }
}

// ================================
// Analyze URL
// ================================
async function analyzeUrl() {
    const url = document.getElementById('urlInput').value.trim();

    if (!url) {
        alert('⚠️ Please enter a URL');
        return;
    }

    // Validate URL format
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('⚠️ URL must start with http:// or https://');
        return;
    }

    document.getElementById('btnUrlText').style.display = 'none';
    document.getElementById('btnUrlLoader').style.display = 'flex';
    document.getElementById('btnAnalyzeUrl').disabled = true;
    document.getElementById('resultCard').style.display = 'none';

    try {
        console.log('Analyzing URL:', url);

        const response = await fetch(API_BASE_URL + '/url/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || errorData.error || 'Failed to fetch article');
        }

        const data = await response.json();
        console.log('✅ URL Result:', data);
        displayResults(data, true, false);

        // Force scroll to results
        setTimeout(() => {
            const resultCard = document.getElementById('resultCard');
            if (resultCard) {
                resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 200);

    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Could not analyze this URL.\n\nReason: ' + error.message + '\n\nPlease try a valid news URL like:\n- https://www.bbc.com/news\n- https://www.reuters.com');
    } finally {
        document.getElementById('btnUrlText').style.display = 'flex';
        document.getElementById('btnUrlLoader').style.display = 'none';
        document.getElementById('btnAnalyzeUrl').disabled = false;
    }
}

// ================================
// Image Functions
// ================================
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('⚠️ Please select an image file');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert('⚠️ File size must be less than 10MB');
        return;
    }

    selectedImage = file;

    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('previewImage').src = e.target.result;
        document.getElementById('previewName').textContent = file.name;
        document.getElementById('previewSize').textContent =
            'Size: ' + (file.size / 1024).toFixed(2) + ' KB';

        document.getElementById('uploadContent').style.display = 'none';
        document.getElementById('previewContent').style.display = 'block';
        document.getElementById('btnAnalyzeImage').disabled = false;
    };
    reader.readAsDataURL(file);
}

function removeImage(event) {
    if (event) event.stopPropagation();
    selectedImage = null;
    document.getElementById('imageInput').value = '';
    document.getElementById('uploadContent').style.display = 'block';
    document.getElementById('previewContent').style.display = 'none';
    document.getElementById('btnAnalyzeImage').disabled = true;
    document.getElementById('resultCard').style.display = 'none';
}

async function analyzeImage() {
    if (!selectedImage) {
        alert('⚠️ Please select an image first');
        return;
    }

    document.getElementById('btnImageText').style.display = 'none';
    document.getElementById('btnImageLoader').style.display = 'flex';
    document.getElementById('btnAnalyzeImage').disabled = true;
    document.getElementById('resultCard').style.display = 'none';

    try {
        const formData = new FormData();
        formData.append('file', selectedImage);

        const response = await fetch(API_BASE_URL + '/images/analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Image analysis failed');

        const data = await response.json();
        console.log('Image Result:', data);
        displayResults(data, false, true);

    } catch (error) {
        console.error('Error:', error);
        alert('❌ ' + error.message);
    } finally {
        document.getElementById('btnImageText').style.display = 'flex';
        document.getElementById('btnImageLoader').style.display = 'none';
        document.getElementById('btnAnalyzeImage').disabled = false;
    }
}

// ================================
// Display Results
// ================================
function displayResults(data, isUrl, isImage) {
    const resultCard = document.getElementById('resultCard');

    const statusMap = {
        'REAL': { icon: '✅', color: '#00D68F' },
        'FAKE': { icon: '❌', color: '#FF4757' },
        'SUSPICIOUS': { icon: '⚠️', color: '#FFA500' },
        'UNVERIFIED': { icon: '❓', color: '#6c757d' }
    };

    const statusInfo = statusMap[data.status] || statusMap['UNVERIFIED'];

    document.getElementById('statusIcon').textContent = statusInfo.icon;
    document.getElementById('statusText').textContent = data.statusDisplay;
    document.getElementById('statusText').style.color = statusInfo.color;

    const score = Math.round(data.credibilityScore);
    document.getElementById('scoreValue').textContent = score;

    const circle = document.getElementById('scoreCircle');
    if (circle) {
        circle.style.color = statusInfo.color;
        const circumference = 377;
        const offset = circumference - (score / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    const extractedSection = document.getElementById('extractedTextSection');
    const extractedBox = document.getElementById('extractedTextBox');

    if (isUrl) {
        extractedSection.style.display = 'block';
        extractedBox.innerHTML =
            '<strong>📄 Title:</strong> ' + escapeHtml(data.title) + '<br>' +
            '<strong>👤 Author:</strong> ' + escapeHtml(data.author || 'Unknown') + '<br>' +
            '<strong>🌐 Platform:</strong> ' + escapeHtml(data.platform || 'Unknown') + '<br>' +
            '<strong>🔗 URL:</strong> ' + escapeHtml(data.sourceUrl || '') + '<br><br>' +
            '<strong>📝 Content:</strong><br>' +
            escapeHtml((data.content || '').substring(0, 300)) + '...';
    } else if (isImage && data.extractedText) {
        extractedSection.style.display = 'block';
        extractedBox.textContent = data.extractedText || 'No text detected';
    } else {
        extractedSection.style.display = 'none';
    }

    if (data.analysisDetails) {
        const breakdownGrid = document.getElementById('breakdownGrid');
        const details = data.analysisDetails;

        let metrics;
        if (isImage) {
            metrics = [
                { label: 'Visual', value: details.visualScore || 0, icon: '👁️' },
                { label: 'Metadata', value: details.metadataScore || 0, icon: '📋' },
                { label: 'OCR', value: details.ocrScore || 0, icon: '🔍' },
                { label: 'Text', value: details.textScore || 0, icon: '📝' }
            ];
        } else {
            metrics = [
                { label: 'ML', value: details.mlScore || 0, icon: '🤖' },
                { label: 'NLP', value: details.nlpScore || 0, icon: '📝' },
                { label: 'Source', value: details.sourceScore || 0, icon: '🔗' },
                { label: 'Clickbait', value: details.clickbaitScore || 0, icon: '🎯' },
                { label: 'Grammar', value: details.grammarScore || 0, icon: '✍️' },
                { label: 'Fact Check', value: details.factCheckScore || 0, icon: '✔️' }
            ];
        }

        let html = '';
        for (let i = 0; i < metrics.length; i++) {
            const m = metrics[i];
            const val = Math.round(m.value);
            const color = val >= 70 ? '#00D68F' : val >= 45 ? '#FFA500' : '#FF4757';
            html += '<div class="breakdown-item">' +
                '<div class="breakdown-header">' +
                '<span>' + m.icon + '</span>' +
                '<span class="breakdown-label">' + m.label + '</span>' +
                '</div>' +
                '<div class="breakdown-value" style="color: ' + color + '">' + val + '%</div>' +
                '<div class="breakdown-bar">' +
                '<div class="breakdown-bar-fill" style="background: ' + color + '; width: ' + val + '%"></div>' +
                '</div>' +
                '</div>';
        }
        breakdownGrid.innerHTML = html;

        document.getElementById('explanationText').textContent =
            details.explanation || 'Analysis complete.';
    }

    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth' });

    setTimeout(function() {
        loadStatistics();
        loadRecentNews();
    }, 1000);
}

// ================================
// Load Statistics
// ================================
async function loadStatistics() {
    try {
        const response = await fetch(API_BASE_URL + '/news/statistics');
        const stats = await response.json();

        if (document.getElementById('heroTotal'))
            document.getElementById('heroTotal').textContent = stats.total || 0;
        if (document.getElementById('heroFake'))
            document.getElementById('heroFake').textContent = stats.fake || 0;
        if (document.getElementById('dashTotal'))
            document.getElementById('dashTotal').textContent = stats.total || 0;
        if (document.getElementById('dashFake'))
            document.getElementById('dashFake').textContent = stats.fake || 0;
        if (document.getElementById('dashReal'))
            document.getElementById('dashReal').textContent = stats.real || 0;
        if (document.getElementById('dashSuspicious'))
            document.getElementById('dashSuspicious').textContent = stats.suspicious || 0;
    } catch (error) {
        console.error('Stats error:', error);
    }
}

// ================================
// Load Recent News
// ================================
async function loadRecentNews() {
    try {
        const response = await fetch(API_BASE_URL + '/news/all');
        const newsList = await response.json();

        const tbody = document.getElementById('newsTableBody');
        if (!tbody) return;

        if (!newsList || newsList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No news analyzed yet.</td></tr>';
            return;
        }

        let html = '';
        const limit = Math.min(newsList.length, 10);
        for (let i = 0; i < limit; i++) {
            const news = newsList[i];
            const score = Math.round(news.credibilityScore);
            const color = score >= 70 ? '#00D68F' : score >= 45 ? '#FFA500' : '#FF4757';
            html += '<tr>' +
                '<td style="max-width:400px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">' +
                escapeHtml(news.title) + '</td>' +
                '<td>' + (news.platform || 'Unknown') + '</td>' +
                '<td style="color: ' + color + '; font-weight: 700">' + score + '%</td>' +
                '<td><span class="status-badge ' + news.status.toLowerCase() + '">' +
                news.statusDisplay + '</span></td>' +
                '</tr>';
        }
        tbody.innerHTML = html;
    } catch (error) {
        console.error('News error:', error);
    }
}

// ================================
// Scroll & Actions
// ================================
function scrollToAnalyzer() {
    const elem = document.getElementById('analyzer');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
}

function scrollToDashboard() {
    const elem = document.getElementById('dashboard');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
}

function shareResult() {
    const status = document.getElementById('statusText').textContent;
    const score = document.getElementById('scoreValue').textContent;
    const text = '🛡️ FakeShield: ' + status + ' (' + score + '%)';

    if (navigator.share) {
        navigator.share({ title: 'FakeShield', text: text });
    } else {
        navigator.clipboard.writeText(text);
        alert('✅ Copied to clipboard!');
    }
}

function copyResult() {
    const status = document.getElementById('statusText').textContent;
    const score = document.getElementById('scoreValue').textContent;
    const explanation = document.getElementById('explanationText').textContent;

    const report = 'FAKESHIELD REPORT\n\nStatus: ' + status + '\nScore: ' + score + '%\n\n' + explanation;

    navigator.clipboard.writeText(report);
    alert('📋 Report copied!');
}

function analyzeAnother() {
    document.getElementById('resultCard').style.display = 'none';
    if (document.getElementById('newsTitle')) document.getElementById('newsTitle').value = '';
    if (document.getElementById('newsContent')) document.getElementById('newsContent').value = '';
    if (document.getElementById('sourceUrl')) document.getElementById('sourceUrl').value = '';
    if (document.getElementById('urlInput')) document.getElementById('urlInput').value = '';
    if (selectedImage) removeImage(null);
    scrollToAnalyzer();
}

// ================================
// Language Switcher
// ================================
function toggleLangDropdown() {
    const dropdown = document.getElementById('langDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function changeLanguage(code, emoji, name) {
    const currentLang = document.getElementById('currentLang');
    if (currentLang) {
        currentLang.textContent = emoji + ' ' + code.toUpperCase();
    }
    const dropdown = document.getElementById('langDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
    alert('✅ Language changed to ' + name);
}

// ================================
// Utility
// ================================
function escapeHtml(text) {
    if (!text) return '';
    const map = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};
    return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
}

// ================================
// Initialize
// ================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛡️ FakeShield Loaded');
    loadStatistics();
    loadRecentNews();

    // Setup tab click handlers with proper event
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(function(btn, index) {
        btn.addEventListener('click', function(e) {
            const tabNames = ['text', 'url', 'image'];
            switchTab(tabNames[index], btn);
        });
    });

    setInterval(function() {
        loadStatistics();
        loadRecentNews();
    }, 30000);
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.language-switcher')) {
        const dropdown = document.getElementById('langDropdown');
        if (dropdown) dropdown.classList.remove('show');
    }
});
// Force show results
function forceShowResult(data) {
    const resultCard = document.getElementById('resultCard');
    if (resultCard) {
        resultCard.style.display = 'block';
        resultCard.style.visibility = 'visible';
        resultCard.scrollIntoView({ behavior: 'smooth' });
        console.log('Result card should be visible now');
    } else {
        console.error('Result card element not found!');
    }
}