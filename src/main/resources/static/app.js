// ============================================
// FakeShield - Complete Frontend Application
// ============================================

const API_URL = window.location.origin;

// ============================================
// AUTH & TOKEN HELPERS
// ============================================

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function isLoggedIn() {
    return !!getToken();
}

function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

function logout() {
    clearAuth();
    window.location.href = '/login.html';
}

async function authFetch(url, options = {}) {
    const token = getToken();
    const headers = { ...(options.headers || {}) };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
}

// ============================================
// GLOBAL STATE
// ============================================

let selectedFile = null;

// ============================================
// TAB SWITCHING & SCROLL HELPERS (Fixes Console Errors)
// ============================================

function switchTab(tabName) {
    console.log('Switching to tab:', tabName);

    // Tab contents
    const textTab = document.getElementById('textTab') || document.getElementById('textSection');
    const urlTab = document.getElementById('urlTab') || document.getElementById('urlSection');
    const imageTab = document.getElementById('imageTab') || document.getElementById('imageSection');

    if (textTab) textTab.style.display = (tabName === 'text') ? 'block' : 'none';
    if (urlTab) urlTab.style.display = (tabName === 'url') ? 'block' : 'none';
    if (imageTab) imageTab.style.display = (tabName === 'image') ? 'block' : 'none';

    // Update active tab buttons
    document.querySelectorAll('.tab-btn, .nav-tab, [onclick*="switchTab"]').forEach(btn => {
        if (btn.getAttribute('onclick')?.includes(tabName)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    hideResults();
}

function scrollToAnalyzer() {
    const analyzer =
        document.getElementById('analyzer') ||
        document.getElementById('analyzeSection') ||
        document.querySelector('.analyzer-container') ||
        document.querySelector('.main-card');

    if (analyzer) {
        analyzer.scrollIntoView({ behavior: 'smooth' });
    }
}

// ============================================
// TEXT NEWS ANALYSIS (Fixes analyzeNews error)
// ============================================

async function analyzeNews() {
    const headlineInput = document.getElementById('newsHeadline') || document.getElementById('headline');
    const contentInput = document.getElementById('newsContent') || document.getElementById('content');
    const sourceInput = document.getElementById('sourceUrl') || document.getElementById('source');
    const platformSelect = document.getElementById('platform');

    const headline = headlineInput ? headlineInput.value.trim() : '';
    const content = contentInput ? contentInput.value.trim() : '';
    const source = sourceInput ? sourceInput.value.trim() : '';
    const platform = platformSelect ? platformSelect.value : 'General';

    if (!headline && !content) {
        showToast('❌ Please enter a news headline or article content', 'error');
        return;
    }

    showProgress(true);
    hideResults();

    try {
        const payload = {
            title: headline,
            content: content || headline,
            sourceUrl: source,
            platform: platform
        };

        const token = getToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/api/news/analyze`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            throw new Error('Server returned invalid JSON response');
        }

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Text analysis failed');
        }

        console.log('✅ Text Analysis Result:', data);
        showResults(data);
        showToast('✅ Analysis complete!', 'success');

    } catch (error) {
        console.error('Text Analysis Error:', error);
        showToast('❌ ' + (error.message || 'Analysis failed'), 'error');
        showErrorBox(error.message);
    } finally {
        showProgress(false);
    }
}

// ============================================
// URL ANALYSIS (Fixes analyzeUrl)
// ============================================

async function analyzeUrl() {
    const urlInput = document.getElementById('urlInput') || document.getElementById('newsUrl');
    const url = urlInput ? urlInput.value.trim() : '';

    if (!url) {
        showToast('❌ Please enter a valid news URL', 'error');
        return;
    }

    showProgress(true);
    hideResults();

    try {
        const token = getToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/api/url/analyze`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ url: url })
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            throw new Error('Server returned invalid JSON response');
        }

        if (!response.ok) {
            throw new Error(data.error || data.message || 'URL analysis failed');
        }

        console.log('✅ URL Analysis Result:', data);
        showResults(data);
        showToast('✅ URL Analysis complete!', 'success');

    } catch (error) {
        console.error('URL Analysis Error:', error);
        showToast('❌ ' + (error.message || 'URL analysis failed'), 'error');
        showErrorBox(error.message);
    } finally {
        showProgress(false);
    }
}

// ============================================
// IMAGE ANALYSIS (With Auth Token for History)
// ============================================

async function analyzeImage() {
    if (!selectedFile) {
        showToast('❌ Please select an image first', 'error');
        return;
    }

    showProgress(true);
    hideResults();

    try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const token = getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/api/images/analyze`, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            throw new Error('Server returned invalid JSON response');
        }

        if (!response.ok) {
            throw new Error(data.error || data.message || `Image analysis failed (${response.status})`);
        }

        console.log('✅ Image Analysis Result:', data);
        showResults(data);

        if (isLoggedIn()) {
            showToast('✅ Saved to your analysis history!', 'success');
        } else {
            showToast('✅ Analysis complete (log in to save to history)', 'success');
        }

    } catch (error) {
        console.error('Image Analysis Error:', error);
        showToast('❌ ' + (error.message || 'Image analysis failed'), 'error');
        showErrorBox(error.message);
    } finally {
        showProgress(false);
    }
}

// ============================================
// FILE UPLOAD UI HANDLERS
// ============================================

function initUploadUI() {
    const fileInput = document.getElementById('fileInput') || document.querySelector('input[type="file"]');
    const dropZone = document.getElementById('dropZone') || document.querySelector('.upload-area') || document.querySelector('.drop-zone');

    if (fileInput) {
        fileInput.accept = 'image/*';
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (file) handleFileSelected(file);
        });
    }

    if (dropZone) {
        ['dragenter', 'dragover'].forEach(evt => {
            dropZone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(evt => {
            dropZone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('dragover');
            });
        });

        dropZone.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files && e.dataTransfer.files[0];
            if (file) handleFileSelected(file);
        });

        dropZone.addEventListener('click', () => {
            if (fileInput) fileInput.click();
        });
    }
}

function handleFileSelected(file) {
    if (!file.type || !file.type.startsWith('image/')) {
        showToast('❌ Please select a valid image file', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showToast('❌ Image too large. Max 5MB allowed.', 'error');
        return;
    }

    selectedFile = file;
    showFilePreview(file);
    hideResults();
}

function showFilePreview(file) {
    const previewImg = document.getElementById('previewImage') || document.getElementById('imagePreview');
    const fileNameEl = document.getElementById('fileName');
    const fileSizeEl = document.getElementById('fileSize');
    const previewBox = document.getElementById('previewBox') || document.querySelector('.preview-box');

    if (previewImg) {
        previewImg.src = URL.createObjectURL(file);
        previewImg.style.display = 'block';
    }
    if (fileNameEl) fileNameEl.textContent = file.name;
    if (fileSizeEl) fileSizeEl.textContent = `Size: ${(file.size / 1024).toFixed(2)} KB`;
    if (previewBox) previewBox.style.display = 'block';
}

function clearSelectedFile() {
    selectedFile = null;
    const fileInput = document.getElementById('fileInput') || document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';

    const previewImg = document.getElementById('previewImage') || document.getElementById('imagePreview');
    if (previewImg) {
        previewImg.src = '';
        previewImg.style.display = 'none';
    }

    const previewBox = document.getElementById('previewBox') || document.querySelector('.preview-box');
    if (previewBox) previewBox.style.display = 'none';

    hideResults();
}

// ============================================
// RESULTS & PROGRESS UI
// ============================================

function showResults(data) {
    const resultCard = document.getElementById('resultCard') || document.getElementById('results') || document.querySelector('.result-card');

    fillIfExists('credibilityScore', formatScore(data.credibilityScore));
    fillIfExists('statusBadge', data.status || 'UNKNOWN');
    fillIfExists('visualScore', formatScore(data.visualScore));
    fillIfExists('metadataScore', formatScore(data.metadataScore));
    fillIfExists('textScore', formatScore(data.textAnalysisScore));
    fillIfExists('ocrScore', formatScore(data.ocrScore));
    fillIfExists('extractedText', data.extractedText || 'No text extracted');
    fillIfExists('explanation', data.explanation || 'No explanation available');

    if (resultCard) {
        resultCard.style.display = 'block';
        resultCard.style.visibility = 'visible';
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        renderFallbackResult(data);
    }
}

function hideResults() {
    const resultCard = document.getElementById('resultCard') || document.getElementById('results') || document.querySelector('.result-card');
    if (resultCard) resultCard.style.display = 'none';

    const fallback = document.getElementById('fs-fallback-result');
    if (fallback) fallback.remove();

    const err = document.getElementById('fs-error-box');
    if (err) err.remove();
}

function renderFallbackResult(data) {
    let box = document.getElementById('fs-fallback-result');
    if (!box) {
        box = document.createElement('div');
        box.id = 'fs-fallback-result';
        box.style.cssText = `
            max-width: 720px; margin: 20px auto; padding: 20px;
            border-radius: 16px; color: white;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.12);
        `;
        document.body.appendChild(box);
    }

    const status = data.status || 'UNKNOWN';
    const score = formatScore(data.credibilityScore);
    const color = status === 'REAL' ? '#10b981' : status === 'FAKE' ? '#ef4444' : '#f59e0b';

    box.innerHTML = `
        <h2 style="margin:0 0 10px;">🛡️ Analysis Result</h2>
        <div style="font-size:28px;font-weight:800;color:${color};margin-bottom:8px;">
            ${escapeHtml(status)} • ${score}%
        </div>
        <div style="margin-top:12px;">
            <strong>Explanation:</strong>
            <pre style="white-space:pre-wrap;background:rgba(0,0,0,0.25);padding:12px;border-radius:10px;">${escapeHtml(data.explanation || 'Analysis completed')}</pre>
        </div>
        ${isLoggedIn() ? `<div style="margin-top:14px;"><a href="/history.html" style="color:#4facfe;font-weight:600;">View in My History →</a></div>` : ''}
    `;

    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showErrorBox(message) {
    let box = document.getElementById('fs-error-box');
    if (!box) {
        box = document.createElement('div');
        box.id = 'fs-error-box';
        box.style.cssText = `
            max-width: 720px; margin: 16px auto; padding: 14px 16px;
            border-radius: 12px; color: #fecaca;
            background: rgba(239,68,68,0.12);
            border: 1px solid rgba(239,68,68,0.35);
        `;
        document.body.appendChild(box);
    }
    box.textContent = message;
}

function showProgress(show) {
    let el = document.getElementById('fs-progress');
    if (!show) {
        if (el) el.remove();
        return;
    }
    if (!el) {
        el = document.createElement('div');
        el.id = 'fs-progress';
        el.style.cssText = `max-width: 720px; margin: 16px auto; color: white; text-align:center;`;
        el.innerHTML = `
            <div style="height:8px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,0.08);margin-bottom:8px;">
                <div style="height:100%;width:40%;background:linear-gradient(90deg,#00f2fe,#4facfe,#a855f7);animation: fsSlide 1.2s ease-in-out infinite;"></div>
            </div>
            <div style="opacity:.85;">🔍 Analyzing, please wait...</div>
            <style>@keyframes fsSlide { 0% { transform: translateX(-120%); } 100% { transform: translateX(320%); } }</style>
        `;
        document.body.appendChild(el);
    }
}

function showToast(message, type = 'info') {
    let host = document.getElementById('fs-toast-host');
    if (!host) {
        host = document.createElement('div');
        host.id = 'fs-toast-host';
        host.style.cssText = `position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 10000; display:flex; flex-direction:column; gap:8px;`;
        document.body.appendChild(host);
    }

    const toast = document.createElement('div');
    const bg = type === 'success' ? 'rgba(16,185,129,0.15)' : type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(79,172,254,0.15)';
    const border = type === 'success' ? 'rgba(16,185,129,0.4)' : type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(79,172,254,0.4)';
    const color = type === 'success' ? '#6ee7b7' : type === 'error' ? '#fecaca' : '#bfdbfe';

    toast.style.cssText = `
        min-width: 280px; max-width: 90vw; padding: 12px 16px; border-radius: 12px;
        background: ${bg}; border: 1px solid ${border}; color: ${color};
        backdrop-filter: blur(10px); box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        font-family: Inter, system-ui, sans-serif; font-size: 14px;
    `;
    toast.textContent = message;
    host.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity .3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ============================================
// USER MENU INITIALIZATION
// ============================================

function initUserMenu() {
    const user = getUser();
    const old = document.getElementById('fs-user-menu-wrap');
    if (old) old.remove();

    const wrap = document.createElement('div');
    wrap.id = 'fs-user-menu-wrap';
    wrap.style.cssText = `position: fixed; top: 18px; right: 18px; z-index: 9999; font-family: Inter, system-ui, sans-serif;`;

    if (user) {
        const initials = (user.fullName || user.username || 'U').slice(0, 2).toUpperCase();
        wrap.innerHTML = `
            <div style="position:relative;">
                <button id="fsUserBtn" style="
                    width:44px;height:44px;border-radius:50%;
                    border:2px solid rgba(255,255,255,0.15);
                    background: linear-gradient(135deg,#00f2fe,#a855f7);
                    color:white;font-weight:700;cursor:pointer;
                    box-shadow:0 8px 24px rgba(0,0,0,0.25);
                ">${initials}</button>

                <div id="fsUserDropdown" style="
                    display:none; position:absolute; right:0; top:54px;
                    min-width:220px; background:rgba(20,20,40,0.96);
                    border:1px solid rgba(255,255,255,0.1);
                    border-radius:14px; overflow:hidden;
                    box-shadow:0 16px 40px rgba(0,0,0,0.35);
                ">
                    <div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.08);">
                        <div style="color:#fff;font-weight:700;">${escapeHtml(user.fullName || user.username)}</div>
                        <div style="color:rgba(255,255,255,0.6);font-size:12px;">${escapeHtml(user.email || '')}</div>
                    </div>
                    <a href="/history.html" style="display:block;padding:12px 16px;color:#fff;text-decoration:none;">📜 My History</a>
                    <button id="fsLogoutBtn" style="
                        width:100%;text-align:left;padding:12px 16px;
                        background:transparent;border:none;border-top:1px solid rgba(255,255,255,0.08);
                        color:#ef4444;cursor:pointer;font-size:14px;
                    ">🚪 Logout</button>
                </div>
            </div>
        `;
    } else {
        wrap.innerHTML = `
            <a href="/login.html" style="
                display:inline-block;padding:10px 16px;border-radius:10px;
                background:linear-gradient(135deg,#00f2fe,#a855f7);
                color:white;text-decoration:none;font-weight:700;
                box-shadow:0 8px 24px rgba(0,0,0,0.25);
            ">Login</a>
        `;
    }

    document.body.appendChild(wrap);

    const btn = document.getElementById('fsUserBtn');
    const dropdown = document.getElementById('fsUserDropdown');
    const logoutBtn = document.getElementById('fsLogoutBtn');

    if (btn && dropdown) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// ============================================
// UTILITIES
// ============================================

function fillIfExists(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function formatScore(v) {
    const n = Number(v);
    return Number.isNaN(n) ? '0' : n.toFixed(0);
}

function escapeHtml(str) {
    return String(str || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

// ============================================
// DOM LOAD INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🛡️ FakeShield Loaded');
    initUserMenu();
    initUploadUI();
});

// ============================================
// EXPOSE FUNCTIONS TO WINDOW (Fixes onclick errors)
// ============================================

window.switchTab = switchTab;
window.scrollToAnalyzer = scrollToAnalyzer;
window.analyzeNews = analyzeNews;
window.analyzeUrl = analyzeUrl;
window.analyzeImage = analyzeImage;
window.clearSelectedFile = clearSelectedFile;
window.logout = logout;