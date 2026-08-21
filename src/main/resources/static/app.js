// ============================================
// FakeShield - Main Frontend Application
// ============================================

const API_URL = window.location.origin;

// ============================================
// AUTH HELPERS
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

function saveAuth(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
        id: data.userId,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        role: data.role
    }));
}

function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

function logout() {
    clearAuth();
    window.location.href = '/login.html';
}

// Authenticated fetch helper
async function authFetch(url, options = {}) {
    const token = getToken();
    const headers = {
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
        ...options,
        headers
    });
}

// ============================================
// GLOBAL STATE
// ============================================

let selectedFile = null;

// ============================================
// DOM READY
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🛡️ FakeShield Loaded');
    initUserMenu();
    initUploadUI();
    initAnalyzeButton();
    initRemoveButton();
});

// ============================================
// USER MENU
// ============================================

function initUserMenu() {
    const user = getUser();

    // Try common nav containers
    const nav =
        document.querySelector('nav') ||
        document.querySelector('.navbar') ||
        document.querySelector('header') ||
        document.body;

    // Remove old menu if exists
    const old = document.getElementById('fs-user-menu-wrap');
    if (old) old.remove();

    const wrap = document.createElement('div');
    wrap.id = 'fs-user-menu-wrap';
    wrap.style.cssText = `
        position: fixed;
        top: 18px;
        right: 18px;
        z-index: 9999;
        font-family: Inter, system-ui, sans-serif;
    `;

    if (user) {
        const initials = getInitials(user.fullName || user.username || 'U');
        wrap.innerHTML = `
            <div class="fs-user-menu" style="position:relative;">
                <button id="fsUserBtn" style="
                    width:44px;height:44px;border-radius:50%;
                    border:2px solid rgba(255,255,255,0.15);
                    background: linear-gradient(135deg,#00f2fe,#a855f7);
                    color:white;font-weight:700;cursor:pointer;
                    box-shadow:0 8px 24px rgba(0,0,0,0.25);
                ">${initials}</button>

                <div id="fsUserDropdown" style="
                    display:none; position:absolute; right:0; top:54px;
                    min-width:230px; background:rgba(20,20,40,0.96);
                    border:1px solid rgba(255,255,255,0.1);
                    border-radius:14px; overflow:hidden;
                    box-shadow:0 16px 40px rgba(0,0,0,0.35);
                ">
                    <div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.08);">
                        <div style="color:#fff;font-weight:700;margin-bottom:4px;">
                            ${escapeHtml(user.fullName || user.username)}
                        </div>
                        <div style="color:rgba(255,255,255,0.6);font-size:12px;">
                            ${escapeHtml(user.email || '')}
                        </div>
                    </div>
                    <a href="/history.html" style="display:block;padding:12px 16px;color:#fff;text-decoration:none;">📜 My History</a>
                    <a href="/" style="display:block;padding:12px 16px;color:#fff;text-decoration:none;">🏠 Home</a>
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

function getInitials(name) {
    return name
        .split(' ')
        .filter(Boolean)
        .map(p => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// ============================================
// UPLOAD UI
// ============================================

function initUploadUI() {
    const fileInput =
        document.getElementById('fileInput') ||
        document.querySelector('input[type="file"]');

    const dropZone =
        document.getElementById('dropZone') ||
        document.querySelector('.upload-area') ||
        document.querySelector('.drop-zone');

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

        // Click dropzone opens file picker
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

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
        showToast('❌ Image too large. Max 5MB allowed.', 'error');
        return;
    }

    selectedFile = file;
    showFilePreview(file);
    enableAnalyzeButton(true);
    hideResults();
}

function showFilePreview(file) {
    // Common preview elements
    const previewImg =
        document.getElementById('previewImage') ||
        document.getElementById('imagePreview') ||
        document.querySelector('.preview-image');

    const fileNameEl =
        document.getElementById('fileName') ||
        document.querySelector('.file-name');

    const fileSizeEl =
        document.getElementById('fileSize') ||
        document.querySelector('.file-size');

    const previewBox =
        document.getElementById('previewBox') ||
        document.querySelector('.preview-box') ||
        document.querySelector('.file-preview');

    if (previewImg) {
        const url = URL.createObjectURL(file);
        previewImg.src = url;
        previewImg.style.display = 'block';
    }

    if (fileNameEl) {
        fileNameEl.textContent = file.name;
    }

    if (fileSizeEl) {
        fileSizeEl.textContent = `Size: ${(file.size / 1024).toFixed(2)} KB`;
    }

    if (previewBox) {
        previewBox.style.display = 'block';
    }

    // Fallback floating preview if no UI exists
    if (!previewImg && !previewBox) {
        let fallback = document.getElementById('fs-fallback-preview');
        if (!fallback) {
            fallback = document.createElement('div');
            fallback.id = 'fs-fallback-preview';
            fallback.style.cssText = `
                max-width: 520px; margin: 16px auto; padding: 14px;
                border-radius: 14px; background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1); color: white;
            `;
            document.body.appendChild(fallback);
        }
        fallback.innerHTML = `
            <div style="font-weight:700;margin-bottom:6px;">Selected file</div>
            <div>${escapeHtml(file.name)}</div>
            <div style="opacity:.7;font-size:13px;">${(file.size / 1024).toFixed(2)} KB</div>
        `;
    }
}

function clearSelectedFile() {
    selectedFile = null;

    const fileInput =
        document.getElementById('fileInput') ||
        document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';

    const previewImg =
        document.getElementById('previewImage') ||
        document.getElementById('imagePreview') ||
        document.querySelector('.preview-image');
    if (previewImg) {
        previewImg.src = '';
        previewImg.style.display = 'none';
    }

    const previewBox =
        document.getElementById('previewBox') ||
        document.querySelector('.preview-box') ||
        document.querySelector('.file-preview');
    if (previewBox) previewBox.style.display = 'none';

    const fallback = document.getElementById('fs-fallback-preview');
    if (fallback) fallback.remove();

    enableAnalyzeButton(false);
    hideResults();
}

function initRemoveButton() {
    const removeBtn =
        document.getElementById('removeBtn') ||
        document.getElementById('removeImage') ||
        document.querySelector('.remove-btn');

    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearSelectedFile();
        });
    }
}

// ============================================
// ANALYZE BUTTON
// ============================================

function initAnalyzeButton() {
    const analyzeBtn =
        document.getElementById('analyzeBtn') ||
        document.getElementById('analyzeImageBtn') ||
        document.querySelector('.analyze-btn') ||
        findButtonByText('Analyze');

    if (!analyzeBtn) {
        console.warn('Analyze button not found. Looking for fallback...');
        return;
    }

    analyzeBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await analyzeImage();
    });
}

function enableAnalyzeButton(enabled) {
    const analyzeBtn =
        document.getElementById('analyzeBtn') ||
        document.getElementById('analyzeImageBtn') ||
        document.querySelector('.analyze-btn') ||
        findButtonByText('Analyze');

    if (analyzeBtn) {
        analyzeBtn.disabled = !enabled;
        analyzeBtn.style.opacity = enabled ? '1' : '0.6';
        analyzeBtn.style.pointerEvents = enabled ? 'auto' : 'none';
    }
}

function setAnalyzeLoading(isLoading) {
    const analyzeBtn =
        document.getElementById('analyzeBtn') ||
        document.getElementById('analyzeImageBtn') ||
        document.querySelector('.analyze-btn') ||
        findButtonByText('Analyze');

    if (!analyzeBtn) return;

    if (isLoading) {
        analyzeBtn.dataset.originalText = analyzeBtn.innerHTML;
        analyzeBtn.innerHTML = '⏳ Analyzing Image...';
        analyzeBtn.disabled = true;
    } else {
        analyzeBtn.innerHTML = analyzeBtn.dataset.originalText || '🔍 Analyze Image';
        analyzeBtn.disabled = !selectedFile;
    }
}

// ============================================
// MAIN ANALYZE FUNCTION
// ============================================

async function analyzeImage() {
    if (!selectedFile) {
        showToast('❌ Please select an image first', 'error');
        return;
    }

    setAnalyzeLoading(true);
    hideResults();
    showProgress(true);

    try {
        const formData = new FormData();
        // backend expects "file"
        formData.append('file', selectedFile);

        const token = getToken();
        const headers = {};

        // ✅ CRITICAL: attach JWT so analysis is linked to user
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
            throw new Error('Server returned invalid JSON');
        }

        if (!response.ok) {
            const msg = data?.error || data?.message || `Analysis failed (${response.status})`;
            throw new Error(msg);
        }

        console.log('✅ Analysis result:', data);
        showResults(data);

        if (isLoggedIn()) {
            showToast('✅ Analysis saved to your history!', 'success');
        } else {
            showToast('✅ Analysis complete (login to save history)', 'success');
        }

    } catch (error) {
        console.error('Analyze error:', error);

        let msg = error.message || 'Image analysis failed';

        if (msg.includes('Failed to fetch') || msg.toLowerCase().includes('network')) {
            msg = '🌐 Network error. Please check your connection.';
        } else if (msg.includes('413') || msg.toLowerCase().includes('too large')) {
            msg = '📁 Image too large. Please use under 5MB.';
        } else if (msg.includes('502')) {
            msg = '⚠️ Server busy/timeout. Try a smaller image.';
        } else if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
            msg = '🔐 Session expired. Please login again.';
            setTimeout(() => {
                clearAuth();
                window.location.href = '/login.html';
            }, 1200);
        }

        showToast('❌ ' + msg, 'error');
        showErrorBox(msg);

    } finally {
        setAnalyzeLoading(false);
        showProgress(false);
    }
}

// ============================================
// RESULTS UI
// ============================================

function showResults(data) {
    const resultCard =
        document.getElementById('resultCard') ||
        document.getElementById('results') ||
        document.querySelector('.result-card');

    // If your page already has result elements, fill them
    fillIfExists('credibilityScore', formatScore(data.credibilityScore));
    fillIfExists('statusBadge', data.status || 'UNKNOWN');
    fillIfExists('visualScore', formatScore(data.visualScore));
    fillIfExists('metadataScore', formatScore(data.metadataScore));
    fillIfExists('textScore', formatScore(data.textAnalysisScore));
    fillIfExists('ocrScore', formatScore(data.ocrScore));
    fillIfExists('extractedText', data.extractedText || 'No text extracted');
    fillIfExists('explanation', data.explanation || 'No explanation available');
    fillIfExists('processingTime', `${data.processingTimeMs || 0} ms`);

    if (resultCard) {
        resultCard.style.display = 'block';
        resultCard.style.visibility = 'visible';
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        // Fallback result panel
        renderFallbackResult(data);
    }
}

function hideResults() {
    const resultCard =
        document.getElementById('resultCard') ||
        document.getElementById('results') ||
        document.querySelector('.result-card');

    if (resultCard) {
        resultCard.style.display = 'none';
    }

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
    const color =
        status === 'REAL' ? '#10b981' :
            status === 'FAKE' ? '#ef4444' : '#f59e0b';

    box.innerHTML = `
        <h2 style="margin:0 0 10px;">🛡️ Analysis Result</h2>
        <div style="font-size:28px;font-weight:800;color:${color};margin-bottom:8px;">
            ${escapeHtml(status)} • ${score}%
        </div>
        <div style="opacity:.85;margin-bottom:8px;">
            Visual: ${formatScore(data.visualScore)}% |
            Metadata: ${formatScore(data.metadataScore)}% |
            Text: ${formatScore(data.textAnalysisScore)}% |
            OCR: ${formatScore(data.ocrScore)}%
        </div>
        <div style="opacity:.8;margin-bottom:8px;">⏱️ ${data.processingTimeMs || 0} ms</div>
        <div style="margin-top:12px;">
            <strong>Extracted Text</strong>
            <pre style="white-space:pre-wrap;background:rgba(0,0,0,0.25);padding:12px;border-radius:10px;overflow:auto;">${escapeHtml(data.extractedText || 'No text extracted')}</pre>
        </div>
        <div style="margin-top:12px;">
            <strong>Explanation</strong>
            <pre style="white-space:pre-wrap;background:rgba(0,0,0,0.25);padding:12px;border-radius:10px;overflow:auto;">${escapeHtml(data.explanation || 'No explanation')}</pre>
        </div>
        ${isLoggedIn() ? `<div style="margin-top:14px;"><a href="/history.html" style="color:#4facfe;">View in My History →</a></div>` : ''}
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

// ============================================
// PROGRESS UI
// ============================================

function showProgress(show) {
    let el = document.getElementById('fs-progress');

    if (!show) {
        if (el) el.remove();
        return;
    }

    if (!el) {
        el = document.createElement('div');
        el.id = 'fs-progress';
        el.style.cssText = `
            max-width: 720px; margin: 16px auto; color: white; text-align:center;
        `;
        el.innerHTML = `
            <div style="
                height:8px;border-radius:999px;overflow:hidden;
                background:rgba(255,255,255,0.08);margin-bottom:8px;
            ">
                <div style="
                    height:100%;width:40%;
                    background:linear-gradient(90deg,#00f2fe,#4facfe,#a855f7);
                    animation: fsSlide 1.2s ease-in-out infinite;
                "></div>
            </div>
            <div style="opacity:.85;">🔍 Analyzing image, please wait...</div>
            <style>
                @keyframes fsSlide {
                    0% { transform: translateX(-120%); }
                    100% { transform: translateX(320%); }
                }
            </style>
        `;
        document.body.appendChild(el);
    }
}

// ============================================
// TOAST
// ============================================

function showToast(message, type = 'info') {
    let host = document.getElementById('fs-toast-host');
    if (!host) {
        host = document.createElement('div');
        host.id = 'fs-toast-host';
        host.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            z-index: 10000; display:flex; flex-direction:column; gap:8px;
        `;
        document.body.appendChild(host);
    }

    const toast = document.createElement('div');
    const bg =
        type === 'success' ? 'rgba(16,185,129,0.15)' :
            type === 'error' ? 'rgba(239,68,68,0.15)' :
                'rgba(79,172,254,0.15)';
    const border =
        type === 'success' ? 'rgba(16,185,129,0.4)' :
            type === 'error' ? 'rgba(239,68,68,0.4)' :
                'rgba(79,172,254,0.4)';
    const color =
        type === 'success' ? '#6ee7b7' :
            type === 'error' ? '#fecaca' :
                '#bfdbfe';

    toast.style.cssText = `
        min-width: 280px; max-width: 90vw;
        padding: 12px 16px; border-radius: 12px;
        background: ${bg}; border: 1px solid ${border};
        color: ${color}; backdrop-filter: blur(10px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        font-family: Inter, system-ui, sans-serif;
        font-size: 14px;
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
// UTILITIES
// ============================================

function fillIfExists(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function formatScore(v) {
    const n = Number(v);
    if (Number.isNaN(n)) return '0';
    return n.toFixed(0);
}

function escapeHtml(str) {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function findButtonByText(text) {
    const buttons = Array.from(document.querySelectorAll('button, a.button, .btn'));
    return buttons.find(btn => (btn.textContent || '').toLowerCase().includes(text.toLowerCase())) || null;
}

// Optional global exports
window.FakeShield = {
    analyzeImage,
    logout,
    isLoggedIn,
    getUser,
    getToken,
    clearSelectedFile
};