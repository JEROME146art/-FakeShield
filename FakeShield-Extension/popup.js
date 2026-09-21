// ===================================================================
// FakeShield Chrome Extension - Multi-Modal AI Detector (Text / URL / Image)
// ===================================================================

const DEFAULT_API_URL = 'http://localhost:8090';
let API_URL = DEFAULT_API_URL;
let selectedImageFile = null;
let lastResultData = null;

// ===================================================================
// Initialization
// ===================================================================
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Load saved API URL or default
    chrome.storage.local.get(['apiUrl', 'selectedText', 'selectedUrl', 'activeTabId'], (data) => {
        if (data.apiUrl) {
            API_URL = data.apiUrl.replace(/\/+$/, '');
            document.getElementById('apiUrlInput').value = API_URL;
        } else {
            API_URL = DEFAULT_API_URL;
            document.getElementById('apiUrlInput').value = API_URL;
        }

        // Auto-fill context menu text if any
        if (data.selectedText) {
            document.getElementById('contentInput').value = data.selectedText;
            switchTab('content');
            chrome.storage.local.remove(['selectedText']);
        } else if (data.selectedUrl) {
            document.getElementById('urlInput').value = data.selectedUrl;
            switchTab('url');
            chrome.storage.local.remove(['selectedUrl']);
        }

        checkServerHealth();
    });

    // 2. Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // 3. Action Listeners
    document.getElementById('btnAnalyzeContent').addEventListener('click', analyzeContent);
    document.getElementById('btnAnalyzeUrl').addEventListener('click', analyzeUrl);
    document.getElementById('btnAnalyzeImage').addEventListener('click', analyzeImage);
    document.getElementById('btnPasteContent').addEventListener('click', pasteContent);
    document.getElementById('btnUseCurrentTab').addEventListener('click', useCurrentTabUrl);
    document.getElementById('btnSampleReal').addEventListener('click', () => loadSample('real'));
    document.getElementById('btnSampleFake').addEventListener('click', () => loadSample('fake'));
    document.getElementById('btnCopyReport').addEventListener('click', copyReport);
    document.getElementById('btnClearResult').addEventListener('click', clearAll);
    document.getElementById('btnOpenWebDashboard').addEventListener('click', openWebDashboard);

    // 4. Image Upload & Dropzone
    const dropzone = document.getElementById('imageDropzone');
    const fileInput = document.getElementById('imageFileInput');
    const btnRemoveImg = document.getElementById('btnRemoveImage');

    dropzone.addEventListener('click', (e) => {
        if (e.target !== btnRemoveImg && !btnRemoveImg.contains(e.target)) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleImageSelected(e.target.files[0]);
        }
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageSelected(e.dataTransfer.files[0]);
        }
    });

    btnRemoveImg.addEventListener('click', (e) => {
        e.stopPropagation();
        resetImageUpload();
    });

    // 5. Settings Drawer
    const btnSettings = document.getElementById('btnSettings');
    const settingsDrawer = document.getElementById('settingsDrawer');
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    const btnSaveSettings = document.getElementById('btnSaveSettings');

    btnSettings.addEventListener('click', () => {
        settingsDrawer.style.display = settingsDrawer.style.display === 'none' ? 'block' : 'none';
    });

    btnCloseSettings.addEventListener('click', () => {
        settingsDrawer.style.display = 'none';
    });

    btnSaveSettings.addEventListener('click', () => {
        const customUrl = document.getElementById('apiUrlInput').value.trim().replace(/\/+$/, '');
        if (customUrl) {
            API_URL = customUrl;
            chrome.storage.local.set({ apiUrl: customUrl }, () => {
                showToast('✅ Saved endpoint: ' + customUrl);
                settingsDrawer.style.display = 'none';
                checkServerHealth();
            });
        }
    });

    document.querySelectorAll('.preset-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.getElementById('apiUrlInput').value = pill.dataset.url;
        });
    });
});

// ===================================================================
// Server Health Check
// ===================================================================
async function checkServerHealth() {
    const dot = document.querySelector('.status-dot');
    const statusWrap = document.getElementById('serverStatus');
    
    try {
        const res = await fetch(`${API_URL}/api/news/statistics`, { method: 'GET' });
        if (res.ok) {
            dot.className = 'status-dot online';
            statusWrap.title = `Backend Connected (${API_URL})`;
            return true;
        } else {
            dot.className = 'status-dot offline';
            statusWrap.title = `Backend Error ${res.status} (${API_URL})`;
            return false;
        }
    } catch (e) {
        dot.className = 'status-dot offline';
        statusWrap.title = `Backend Offline (${API_URL}) - Click ⚙️ to configure`;
        return false;
    }
}

// ===================================================================
// Tab Navigation
// ===================================================================
function switchTab(tabKey) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabKey);
    });

    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.style.display = pane.id === `tab-${tabKey}` ? 'flex' : 'none';
    });
}

// ===================================================================
// 1. Content / Text Analysis
// ===================================================================
async function analyzeContent() {
    const text = document.getElementById('contentInput').value.trim();
    if (!text) {
        showToast('⚠️ Please enter news text or headline');
        return;
    }

    setBtnLoading('btnAnalyzeContent', true);
    hideResult();

    try {
        const response = await fetch(`${API_URL}/api/news/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: text.substring(0, 180),
                content: text,
                sourceUrl: '',
                platform: 'Chrome Extension'
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || errData.message || `Server Error ${response.status}`);
        }

        const data = await response.json();
        renderResult(data, 'content');
        showToast('✅ Content Analyzed!');
    } catch (error) {
        console.error('Analysis error:', error);
        showToast('❌ ' + error.message);
    } finally {
        setBtnLoading('btnAnalyzeContent', false);
    }
}

// ===================================================================
// 2. URL Analysis
// ===================================================================
async function analyzeUrl() {
    let url = document.getElementById('urlInput').value.trim();
    if (!url) {
        showToast('⚠️ Please enter a news article URL');
        return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
        document.getElementById('urlInput').value = url;
    }

    setBtnLoading('btnAnalyzeUrl', true);
    hideResult();

    try {
        const response = await fetch(`${API_URL}/api/url/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || errData.message || `Server Error ${response.status}`);
        }

        const data = await response.json();
        renderResult(data, 'url');
        showToast('✅ URL Analysis complete!');
    } catch (error) {
        console.error('URL error:', error);
        showToast('❌ ' + error.message);
    } finally {
        setBtnLoading('btnAnalyzeUrl', false);
    }
}

// ===================================================================
// 3. Image Analysis
// ===================================================================
function handleImageSelected(file) {
    if (!file || !file.type.startsWith('image/')) {
        showToast('❌ Please choose a valid image file');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showToast('❌ Max image size is 5MB');
        return;
    }

    selectedImageFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('imagePreviewImg').src = e.target.result;
        document.getElementById('imagePreviewName').textContent = file.name;
        document.getElementById('imagePreviewSize').textContent = `${(file.size / 1024).toFixed(1)} KB`;

        document.getElementById('dropzoneIdle').style.display = 'none';
        document.getElementById('dropzonePreview').style.display = 'flex';
        document.getElementById('btnAnalyzeImage').disabled = false;
    };
    reader.readAsDataURL(file);
}

function resetImageUpload() {
    selectedImageFile = null;
    document.getElementById('imageFileInput').value = '';
    document.getElementById('dropzoneIdle').style.display = 'block';
    document.getElementById('dropzonePreview').style.display = 'none';
    document.getElementById('btnAnalyzeImage').disabled = true;
}

async function analyzeImage() {
    if (!selectedImageFile) {
        showToast('⚠️ Please upload an image first');
        return;
    }

    setBtnLoading('btnAnalyzeImage', true);
    hideResult();

    try {
        const formData = new FormData();
        formData.append('file', selectedImageFile);

        const response = await fetch(`${API_URL}/api/images/analyze`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || errData.message || `Server Error ${response.status}`);
        }

        const data = await response.json();
        renderResult(data, 'image');
        showToast('✅ Image Verified!');
    } catch (error) {
        console.error('Image error:', error);
        showToast('❌ ' + error.message);
    } finally {
        setBtnLoading('btnAnalyzeImage', false);
    }
}

// ===================================================================
// Result Presentation
// ===================================================================
function renderResult(data, type) {
    lastResultData = data;
    const resultCard = document.getElementById('resultCard');

    const status = (data.status || 'UNVERIFIED').toUpperCase();
    const score = Math.round(data.credibilityScore ?? data.overallScore ?? 0);

    const statusMap = {
        'REAL': { icon: '✅', text: 'Verified Real News', color: '#10B981', gradient: 'linear-gradient(90deg, #10B981, #059669)' },
        'FAKE': { icon: '❌', text: 'Fake News Detected', color: '#EF4444', gradient: 'linear-gradient(90deg, #EF4444, #B91C1C)' },
        'SUSPICIOUS': { icon: '⚠️', text: 'Suspicious Content', color: '#F59E0B', gradient: 'linear-gradient(90deg, #F59E0B, #D97706)' },
        'UNVERIFIED': { icon: '❓', text: 'Unverified Content', color: '#8892A4', gradient: 'linear-gradient(90deg, #8892A4, #475569)' }
    };

    const statusInfo = statusMap[status] || statusMap['UNVERIFIED'];

    // Update Status & Score
    document.getElementById('resStatusIcon').textContent = statusInfo.icon;
    document.getElementById('resStatusText').textContent = statusInfo.text;
    document.getElementById('resStatusText').style.color = statusInfo.color;

    const scoreEl = document.getElementById('resScoreNum');
    scoreEl.textContent = score;
    scoreEl.style.color = statusInfo.color;

    // Animated Bar
    const meterFill = document.getElementById('resMeterFill');
    meterFill.style.background = statusInfo.gradient;
    setTimeout(() => {
        meterFill.style.width = `${Math.min(100, Math.max(5, score))}%`;
    }, 50);

    // OCR extracted text (if present)
    const ocrBox = document.getElementById('resOcrBox');
    const ocrContent = document.getElementById('resOcrContent');
    if (data.extractedText && data.extractedText.trim().length > 0) {
        ocrBox.style.display = 'block';
        ocrContent.textContent = data.extractedText;
    } else {
        ocrBox.style.display = 'none';
    }

    // Metrics Breakdown Grid
    const metricsGrid = document.getElementById('resMetricsGrid');
    const metrics = [];

    if (type === 'image') {
        if (data.visualScore !== undefined) metrics.push({ name: 'Visual Score', val: Math.round(data.visualScore) });
        if (data.metadataScore !== undefined) metrics.push({ name: 'Metadata', val: Math.round(data.metadataScore) });
        if (data.ocrScore !== undefined) metrics.push({ name: 'OCR Clarity', val: Math.round(data.ocrScore) });
        if (data.textAnalysisScore !== undefined) metrics.push({ name: 'Text Authenticity', val: Math.round(data.textAnalysisScore) });
    } else {
        const details = data.analysisDetails || {};
        if (details.clickbaitScore !== undefined) metrics.push({ name: 'Clickbait Filter', val: Math.round(details.clickbaitScore) });
        if (details.sourceScore !== undefined) metrics.push({ name: 'Source Credibility', val: Math.round(details.sourceScore) });
        if (details.grammarScore !== undefined) metrics.push({ name: 'Grammar / Syntax', val: Math.round(details.grammarScore) });
        if (details.sentimentScore !== undefined) metrics.push({ name: 'Tone Neutrality', val: Math.round(details.sentimentScore) });
        if (details.nlpScore !== undefined) metrics.push({ name: 'NLP Score', val: Math.round(details.nlpScore) });
    }

    metricsGrid.innerHTML = metrics.map(m => {
        const color = m.val >= 70 ? '#10B981' : m.val >= 45 ? '#F59E0B' : '#EF4444';
        return `
            <div class="metric-pill">
                <span class="metric-pill-name">${m.name}</span>
                <span class="metric-pill-val" style="color:${color}">${m.val}%</span>
            </div>
        `;
    }).join('');

    // Explanation
    const explanation = data.explanation || (data.analysisDetails && data.analysisDetails.explanation) || 'Multi-factor verification conducted successfully.';
    document.getElementById('resExplanation').textContent = explanation;

    resultCard.style.display = 'flex';
    resultCard.scrollIntoView({ behavior: 'smooth' });
}

function hideResult() {
    document.getElementById('resultCard').style.display = 'none';
}

function clearAll() {
    document.getElementById('contentInput').value = '';
    document.getElementById('urlInput').value = '';
    resetImageUpload();
    hideResult();
}

// ===================================================================
// Helper Utilities & Quick Actions
// ===================================================================
async function pasteContent() {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            document.getElementById('contentInput').value = text;
            showToast('📋 Pasted from clipboard!');
        }
    } catch (e) {
        showToast('⚠️ Clipboard access denied');
    }
}

async function useCurrentTabUrl() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && !tab.url.startsWith('chrome://')) {
            document.getElementById('urlInput').value = tab.url;
            showToast('📌 Captured active tab URL!');
        } else {
            showToast('⚠️ Cannot capture browser internal page');
        }
    } catch (e) {
        showToast('⚠️ Failed to get active tab');
    }
}

const SAMPLES = {
    real: "NASA scientists confirm discovery of atmospheric water vapor on distant exoplanet WASP-96b following comprehensive spectral analysis by James Webb Telescope.",
    fake: "BREAKING SHOCKING SECRET: Doctors hate this 1 weird trick that cures all deadly viruses instantly! Forward to 10 friends before deleted!"
};

function loadSample(type) {
    document.getElementById('contentInput').value = SAMPLES[type];
    showToast(`Loaded ${type.toUpperCase()} sample!`);
}

function copyReport() {
    if (!lastResultData) return;
    const status = (lastResultData.status || 'UNVERIFIED').toUpperCase();
    const score = Math.round(lastResultData.credibilityScore ?? lastResultData.overallScore ?? 0);
    const exp = lastResultData.explanation || (lastResultData.analysisDetails && lastResultData.analysisDetails.explanation) || '';
    
    const text = `🛡️ FakeShield Analysis Report\nVerdict: ${status}\nCredibility Score: ${score}%\n\nDetails:\n${exp}\n\nVerified with FakeShield AI Engine.`;
    navigator.clipboard.writeText(text).then(() => {
        showToast('📋 Report copied to clipboard!');
    });
}

function openWebDashboard(e) {
    e.preventDefault();
    chrome.tabs.create({ url: `${API_URL}/` });
}

function setBtnLoading(btnId, isLoading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = isLoading;
    const label = btn.querySelector('.btn-label');
    const spinner = btn.querySelector('.btn-spinner');
    if (label) label.style.display = isLoading ? 'none' : 'inline-flex';
    if (spinner) spinner.style.display = isLoading ? 'inline-flex' : 'none';
}

function showToast(msg) {
    const toast = document.getElementById('toastMessage');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
}