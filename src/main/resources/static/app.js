// ============================================
// FakeShield - Complete Frontend Application
// ============================================

const API_URL = window.location.origin;

// Global State
let selectedFile = null;

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

// ============================================
// TAB SWITCHING & SCROLL HELPERS
// ============================================

function switchTab(tabName, btnElement) {
    console.log('Switching to tab:', tabName);

    // 1. Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
        tab.classList.remove('active');
    });

    // 2. Deactivate all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. Activate target tab content
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) {
        targetTab.style.display = 'block';
        targetTab.classList.add('active');
    }

    // 4. Activate clicked button
    if (btnElement) {
        btnElement.classList.add('active');
    }

    hideResults();
}

function scrollToAnalyzer() {
    const el = document.getElementById('analyzer');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function scrollToDashboard() {
    const el = document.getElementById('dashboard');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// TEXT NEWS ANALYSIS
// ============================================

async function analyzeNews() {
    // Correct IDs matching index.html
    const headlineInput = document.getElementById('newsTitle') || document.getElementById('newsHeadline');
    const contentInput = document.getElementById('newsContent');
    const sourceInput = document.getElementById('sourceUrl');
    const platformSelect = document.getElementById('platform');

    const headline = headlineInput ? headlineInput.value.trim() : '';
    const content = contentInput ? contentInput.value.trim() : '';
    const source = sourceInput ? sourceInput.value.trim() : '';
    const platform = platformSelect ? platformSelect.value : 'General';

    if (!headline && !content) {
        showToast('❌ Please enter a news headline or article content', 'error');
        return;
    }

    setBtnLoading('btnAnalyze', 'btnText', 'btnLoader', true);
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
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Text analysis failed');
        }

        console.log('✅ Text Analysis Result:', data);
        showResults(data);
        showToast('✅ Analysis complete!', 'success');
        updateDashboardStats();

    } catch (error) {
        console.error('Text Analysis Error:', error);
        showToast('❌ ' + (error.message || 'Analysis failed'), 'error');
        showErrorBox(error.message);
    } finally {
        setBtnLoading('btnAnalyze', 'btnText', 'btnLoader', false);
    }
}

// ============================================
// URL ANALYSIS
// ============================================

async function analyzeUrl() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput ? urlInput.value.trim() : '';

    if (!url) {
        showToast('❌ Please enter a valid news URL', 'error');
        return;
    }

    setBtnLoading('btnAnalyzeUrl', 'btnUrlText', 'btnUrlLoader', true);
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
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            throw new Error(data.error || data.message || 'URL analysis failed');
        }

        console.log('✅ URL Analysis Result:', data);
        showResults(data);
        showToast('✅ URL Analysis complete!', 'success');
        updateDashboardStats();

    } catch (error) {
        console.error('URL Analysis Error:', error);
        showToast('❌ ' + (error.message || 'URL analysis failed'), 'error');
        showErrorBox(error.message);
    } finally {
        setBtnLoading('btnAnalyzeUrl', 'btnUrlText', 'btnUrlLoader', false);
    }
}

// ============================================
// IMAGE ANALYSIS
// ============================================

function handleImageSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (file) handleFileSelected(file);
}

function handleFileSelected(file) {
    if (!file.type || !file.type.startsWith('image/')) {
        showToast('❌ Please select a valid image file', 'error');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showToast('❌ Image too large. Max 10MB allowed.', 'error');
        return;
    }

    selectedFile = file;

    const uploadContent = document.getElementById('uploadContent');
    const previewContent = document.getElementById('previewContent');
    const previewImg = document.getElementById('previewImage');
    const previewName = document.getElementById('previewName');
    const previewSize = document.getElementById('previewSize');
    const btnAnalyzeImage = document.getElementById('btnAnalyzeImage');

    if (previewImg) previewImg.src = URL.createObjectURL(file);
    if (previewName) previewName.textContent = file.name;
    if (previewSize) previewSize.textContent = `${(file.size / 1024).toFixed(2)} KB`;

    if (uploadContent) uploadContent.style.display = 'none';
    if (previewContent) previewContent.style.display = 'block';

    // Enable the analyze button once file is uploaded
    if (btnAnalyzeImage) btnAnalyzeImage.disabled = false;

    hideResults();
}

function removeImage(event) {
    if (event) event.stopPropagation();
    selectedFile = null;

    const fileInput = document.getElementById('imageInput');
    if (fileInput) fileInput.value = '';

    const uploadContent = document.getElementById('uploadContent');
    const previewContent = document.getElementById('previewContent');
    const btnAnalyzeImage = document.getElementById('btnAnalyzeImage');

    if (uploadContent) uploadContent.style.display = 'block';
    if (previewContent) previewContent.style.display = 'none';
    if (btnAnalyzeImage) btnAnalyzeImage.disabled = true;

    hideResults();
}

async function analyzeImage() {
    if (!selectedFile) {
        showToast('❌ Please select an image first', 'error');
        return;
    }

    setBtnLoading('btnAnalyzeImage', 'btnImageText', 'btnImageLoader', true);
    hideResults();

    try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const token = getToken();
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/api/images/analyze`, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            throw new Error(data.error || data.message || `Image analysis failed (${response.status})`);
        }

        console.log('✅ Image Analysis Result:', data);
        showResults(data);
        showToast('✅ Image Analysis complete!', 'success');
        updateDashboardStats();

    } catch (error) {
        console.error('Image Analysis Error:', error);
        showToast('❌ ' + (error.message || 'Image analysis failed'), 'error');
        showErrorBox(error.message);
    } finally {
        setBtnLoading('btnAnalyzeImage', 'btnImageText', 'btnImageLoader', false);
    }
}

// Helper to set button state during API loading
function setBtnLoading(btnId, textId, loaderId, isLoading) {
    const btn = document.getElementById(btnId);
    const text = document.getElementById(textId);
    const loader = document.getElementById(loaderId);

    if (btn) btn.disabled = isLoading;
    if (text) text.style.display = isLoading ? 'none' : 'inline-block';
    if (loader) loader.style.display = isLoading ? 'inline-block' : 'none';
}

// ============================================
// RESULTS UI & CIRCLE SCORE
// ============================================

function showResults(data) {
    const resultCard = document.getElementById('resultCard');
    if (!resultCard) return;

    const status = (data.status || 'UNKNOWN').toUpperCase();
    const score = Math.round(data.credibilityScore || 0);

    // Update Status Text & Icon
    const statusText = document.getElementById('statusText');
    const statusIcon = document.getElementById('statusIcon');

    if (statusText) statusText.textContent = status === 'REAL' ? 'Verified Real News' : status === 'FAKE' ? 'Fake News Detected' : 'Suspicious Content';
    if (statusIcon) statusIcon.textContent = status === 'REAL' ? '✅' : status === 'FAKE' ? '❌' : '⚠️';

    // Update Score Circle & Number
    const scoreValue = document.getElementById('scoreValue');
    const scoreCircle = document.getElementById('scoreCircle');

    if (scoreValue) scoreValue.textContent = score;

    if (scoreCircle) {
        const circumference = 377; // 2 * pi * r (60)
        const offset = circumference - (score / 100) * circumference;
        scoreCircle.style.strokeDashoffset = offset;
        scoreCircle.style.color = status === 'REAL' ? '#10b981' : status === 'FAKE' ? '#ef4444' : '#f59e0b';
    }

    // Extracted Text (OCR / Summary)
    const extractedSection = document.getElementById('extractedTextSection');
    const extractedBox = document.getElementById('extractedTextBox');
    if (data.extractedText) {
        if (extractedSection) extractedSection.style.display = 'block';
        if (extractedBox) extractedBox.textContent = data.extractedText;
    } else {
        if (extractedSection) extractedSection.style.display = 'none';
    }

    // Breakdown Grid
    const breakdownGrid = document.getElementById('breakdownGrid');
    if (breakdownGrid) {
        breakdownGrid.innerHTML = `
            <div class="breakdown-item">
                <span class="breakdown-label">Text Credibility</span>
                <span class="breakdown-value">${Math.round(data.textAnalysisScore || data.credibilityScore || 0)}%</span>
            </div>
            <div class="breakdown-item">
                <span class="breakdown-label">Visual Authenticity</span>
                <span class="breakdown-value">${Math.round(data.visualScore || 100)}%</span>
            </div>
            <div class="breakdown-item">
                <span class="breakdown-label">Metadata Check</span>
                <span class="breakdown-value">${Math.round(data.metadataScore || 100)}%</span>
            </div>
        `;
    }

    // Explanation
    const explanationText = document.getElementById('explanationText');
    if (explanationText) {
        explanationText.textContent = data.explanation || 'Content evaluated across fake news pattern databases and machine learning models.';
    }

    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideResults() {
    const resultCard = document.getElementById('resultCard');
    if (resultCard) resultCard.style.display = 'none';

    const err = document.getElementById('fs-error-box');
    if (err) err.remove();
}

function showErrorBox(message) {
    let box = document.getElementById('fs-error-box');
    if (!box) {
        box = document.createElement('div');
        box.id = 'fs-error-box';
        box.style.cssText = `
            max-width: 800px; margin: 16px auto; padding: 14px 16px;
            border-radius: 12px; color: #fecaca;
            background: rgba(239,68,68,0.12);
            border: 1px solid rgba(239,68,68,0.35); text-align: center;
        `;
        const container = document.querySelector('.analyzer-section .container') || document.body;
        container.appendChild(box);
    }
    box.textContent = '❌ Error: ' + message;
}

// Action Buttons
function shareResult() {
    if (navigator.share) {
        navigator.share({
            title: 'FakeShield Analysis Report',
            text: 'Check this news analysis on FakeShield!',
            url: window.location.href
        }).catch(() => {});
    } else {
        copyResult();
    }
}

function copyResult() {
    const status = document.getElementById('statusText')?.textContent || '';
    const score = document.getElementById('scoreValue')?.textContent || '';
    const text = `🛡️ FakeShield Report:\nStatus: ${status}\nCredibility Score: ${score}%\nAnalyzed via ${window.location.origin}`;

    navigator.clipboard.writeText(text).then(() => {
        showToast('📋 Report copied to clipboard!', 'success');
    });
}

function analyzeAnother() {
    hideResults();
    scrollToAnalyzer();
}

// ============================================
// DASHBOARD & STATS
// ============================================

let stats = { total: 0, fake: 0, real: 0, suspicious: 0 };

function updateDashboardStats() {
    stats.total++;
    // Simple incremental counter for live feeling
    document.getElementById('heroTotal').textContent = stats.total;
    document.getElementById('dashTotal').textContent = stats.total;
}

function loadRecentNews() {
    showToast('🔄 Refreshing live data...', 'info');
}

// ============================================
// LANGUAGE SWITCHER
// ============================================

function toggleLangDropdown() {
    const dropdown = document.getElementById('langDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
}

function changeLanguage(code, flag, name) {
    const currentLang = document.getElementById('currentLang');
    if (currentLang) currentLang.textContent = `${flag} ${code.toUpperCase()}`;
    toggleLangDropdown();
    showToast(`Switched language to ${name}`, 'info');
}

// Close language dropdown on outside click
document.addEventListener('click', (e) => {
    const switcher = document.querySelector('.language-switcher');
    const dropdown = document.getElementById('langDropdown');
    if (switcher && !switcher.contains(e.target) && dropdown) {
        dropdown.style.display = 'none';
    }
});

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.className = 'toast';
    }, 3500);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛡️ FakeShield Initialized');
});

// ============================================
// EXPOSE FUNCTIONS TO WINDOW
// ============================================
window.switchTab = switchTab;
window.scrollToAnalyzer = scrollToAnalyzer;
window.scrollToDashboard = scrollToDashboard;
window.analyzeNews = analyzeNews;
window.analyzeUrl = analyzeUrl;
window.handleImageSelect = handleImageSelect;
window.removeImage = removeImage;
window.analyzeImage = analyzeImage;
window.shareResult = shareResult;
window.copyResult = copyResult;
window.analyzeAnother = analyzeAnother;
window.loadRecentNews = loadRecentNews;
window.toggleLangDropdown = toggleLangDropdown;
window.changeLanguage = changeLanguage;