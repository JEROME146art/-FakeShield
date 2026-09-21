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
// SAMPLE PRESETS
// ============================================

const SAMPLE_PRESETS = {
    real: {
        title: "NASA Webb Telescope Detects Water Vapor Around Distant Exoplanet",
        content: "According to an official statement published by NASA scientists, data collected from the James Webb Space Telescope confirms atmospheric water vapor on exoplanet WASP-96b. Researchers found distinct spectral fingerprints indicating cloud coverage and moisture. Verified reports indicate further study is underway.",
        sourceUrl: "https://nasa.gov/news/webb-water-vapor-discovery",
        platform: "News Website"
    },
    fake: {
        title: "SHOCKING SECRET CURE: Doctors Hate This 1 Miracle Trick That Cures All Diseases!",
        content: "What they don't want you to know! Banned video reveals secret miracle cure they are hiding. Share before deleted by corrupt fake news media! Wake up before it is too late! Click here now!",
        sourceUrl: "http://miracle-cure-secret-exposed.click",
        platform: "Facebook"
    },
    whatsapp: {
        title: "URGENT WARNING: Government Shutting Down All Internet Services Tonight At Midnight!!",
        content: "Forwarded many times as received: Emergency alert issued by high officials. Total blackout of 5G, Wi-Fi and calls across country starting 12:00 AM tonight! Share to all your family groups immediately before network cuts off!",
        sourceUrl: "",
        platform: "WhatsApp"
    }
};

function loadSample(type) {
    const sample = SAMPLE_PRESETS[type];
    if (!sample) return;

    const titleInput = document.getElementById('newsTitle');
    const contentInput = document.getElementById('newsContent');
    const urlInput = document.getElementById('sourceUrl');
    const platformSelect = document.getElementById('platform');

    if (titleInput) titleInput.value = sample.title;
    if (contentInput) contentInput.value = sample.content;
    if (urlInput) urlInput.value = sample.sourceUrl;
    if (platformSelect) platformSelect.value = sample.platform;

    showToast(`Loaded ${type.toUpperCase()} sample! Click 'Analyze Text' below.`, 'info');
}

// Global cached news data
let allRecentNews = [];
let currentFilter = 'ALL';
let lastAnalyzedData = null;

// ============================================
// RESULTS UI & CIRCLE SCORE
// ============================================

function showResults(data) {
    lastAnalyzedData = data;
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
        if (data.visualScore !== undefined || data.imageType !== undefined) {
            // Image Analysis breakdown
            const visualScore = Math.round(data.visualScore ?? 80);
            const metadataScore = Math.round(data.metadataScore ?? 70);
            const textScore = Math.round(data.textAnalysisScore ?? 60);
            const ocrScore = Math.round(data.ocrScore ?? 70);

            breakdownGrid.innerHTML = `
                <div class="breakdown-item">
                    <div class="breakdown-header">
                        <span class="breakdown-label">Visual Integrity & Resolution</span>
                        <span class="breakdown-value">${visualScore}%</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${visualScore}%; background: ${visualScore >= 60 ? '#10b981' : '#ef4444'};"></div></div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-header">
                        <span class="breakdown-label">File Metadata & Format</span>
                        <span class="breakdown-value">${metadataScore}%</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${metadataScore}%; background: ${metadataScore >= 60 ? '#10b981' : '#f59e0b'};"></div></div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-header">
                        <span class="breakdown-label">Extracted Text Authenticity</span>
                        <span class="breakdown-value">${textScore}%</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${textScore}%; background: ${textScore >= 60 ? '#10b981' : '#ef4444'};"></div></div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-header">
                        <span class="breakdown-label">OCR Recognition Quality</span>
                        <span class="breakdown-value">${ocrScore}%</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${ocrScore}%; background: ${ocrScore >= 60 ? '#10b981' : '#3b82f6'};"></div></div>
                </div>
            `;
        } else {
            const details = data.analysisDetails || {};
            const breakdown = details.scoreBreakdown || {};

            const clickbaitScore = Math.round(details.clickbaitScore ?? breakdown['Clickbait Detection'] ?? 100);
            const sentimentScore = Math.round(details.sentimentScore ?? breakdown['Sentiment Analysis'] ?? 100);
            const sourceScore = Math.round(details.sourceScore ?? breakdown['Source Credibility'] ?? 50);
            const grammarScore = Math.round(details.grammarScore ?? breakdown['Grammar Check'] ?? 75);
            const nlpScore = Math.round(details.nlpScore ?? breakdown['NLP Analysis'] ?? 70);
            const factCheckScore = Math.round(details.factCheckScore ?? breakdown['Fact Check'] ?? 60);

            breakdownGrid.innerHTML = `
                <div class="breakdown-item">
                    <div class="breakdown-header">
                        <span class="breakdown-label">Clickbait Cleanliness</span>
                        <span class="breakdown-value">${clickbaitScore}%</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${clickbaitScore}%; background: ${clickbaitScore > 60 ? '#10b981' : '#ef4444'};"></div></div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-header">
                        <span class="breakdown-label">Sentiment & Tone Neutrality</span>
                        <span class="breakdown-value">${sentimentScore}%</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${sentimentScore}%; background: ${sentimentScore > 60 ? '#10b981' : '#f59e0b'};"></div></div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-header">
                        <span class="breakdown-label">Source Credibility</span>
                        <span class="breakdown-value">${sourceScore}%</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${sourceScore}%; background: ${sourceScore > 60 ? '#10b981' : '#f59e0b'};"></div></div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-header">
                        <span class="breakdown-label">Grammar & Structure</span>
                        <span class="breakdown-value">${grammarScore}%</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${grammarScore}%; background: ${grammarScore > 60 ? '#10b981' : '#ef4444'};"></div></div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-header">
                        <span class="breakdown-label">NLP Contextual Quality</span>
                        <span class="breakdown-value">${nlpScore}%</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${nlpScore}%; background: ${nlpScore > 60 ? '#10b981' : '#3b82f6'};"></div></div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-header">
                        <span class="breakdown-label">Fact Check Signals</span>
                        <span class="breakdown-value">${factCheckScore}%</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${factCheckScore}%; background: ${factCheckScore > 60 ? '#10b981' : '#a855f7'};"></div></div>
                </div>
            `;
        }
    }

    // Explanation
    const explanationText = document.getElementById('explanationText');
    if (explanationText) {
        const explanation = data.explanation || (data.analysisDetails && data.analysisDetails.explanation);
        explanationText.textContent = explanation || 'Content evaluated across fake news pattern databases and machine learning models.';
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

function downloadReport() {
    if (!lastAnalyzedData) {
        showToast('❌ No analysis report available to download.', 'error');
        return;
    }

    const title = lastAnalyzedData.title || 'Untitled Report';
    const status = lastAnalyzedData.status || 'UNKNOWN';
    const score = lastAnalyzedData.credibilityScore || 0;
    const explanation = lastAnalyzedData.explanation || (lastAnalyzedData.analysisDetails && lastAnalyzedData.analysisDetails.explanation) || 'No details provided.';

    const reportContent = `==================================================
🛡️ FAKESHIELD AI ANALYSIS REPORT
==================================================
Date: ${new Date().toLocaleString()}
Title: ${title}
Source URL: ${lastAnalyzedData.sourceUrl || 'N/A'}
Platform: ${lastAnalyzedData.platform || 'General'}

--------------------------------------------------
RESULTS & SCORE
--------------------------------------------------
Status: ${status}
Credibility Score: ${score}%

--------------------------------------------------
DETAILED AI ANALYSIS EXPLANATION
--------------------------------------------------
${explanation}

==================================================
Generated by FakeShield AI Platform
==================================================`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FakeShield_Report_${Date.now()}.txt`;
    link.click();
    showToast('💾 Report downloaded successfully!', 'success');
}

function analyzeAnother() {
    hideResults();
    scrollToAnalyzer();
}

// ============================================
// DASHBOARD & LIVE RECENT NEWS
// ============================================

async function loadDashboardData() {
    try {
        const statsRes = await fetch(`${API_URL}/api/news/statistics`);
        if (statsRes.ok) {
            const statsData = await statsRes.json();
            const total = statsData.total || 0;
            const fake = statsData.fake || 0;
            const real = statsData.real || 0;
            const suspicious = statsData.suspicious || 0;

            const heroTotal = document.getElementById('heroTotal');
            const heroFake = document.getElementById('heroFake');
            const dashTotal = document.getElementById('dashTotal');
            const dashFake = document.getElementById('dashFake');
            const dashReal = document.getElementById('dashReal');
            const dashSuspicious = document.getElementById('dashSuspicious');

            if (heroTotal) heroTotal.textContent = total;
            if (heroFake) heroFake.textContent = fake;
            if (dashTotal) dashTotal.textContent = total;
            if (dashFake) dashFake.textContent = fake;
            if (dashReal) dashReal.textContent = real;
            if (dashSuspicious) dashSuspicious.textContent = suspicious;
        }

        const newsRes = await fetch(`${API_URL}/api/news/all`);
        if (newsRes.ok) {
            allRecentNews = await newsRes.json();
            renderRecentNewsTable();
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
}

function renderRecentNewsTable() {
    const tableBody = document.getElementById('newsTableBody');
    if (!tableBody) return;

    let items = allRecentNews;
    if (currentFilter !== 'ALL') {
        items = items.filter(n => (n.status || '').toUpperCase() === currentFilter);
    }

    if (!items || items.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    No ${currentFilter === 'ALL' ? '' : currentFilter.toLowerCase()} news items found.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = items.map(n => {
        const status = (n.status || 'UNKNOWN').toUpperCase();
        const score = Math.round(n.credibilityScore || 0);
        const statusBadge = status === 'REAL' ? '✅ Real' : status === 'FAKE' ? '❌ Fake' : '⚠️ Suspicious';
        const badgeClass = status === 'REAL' ? 'badge-real' : status === 'FAKE' ? 'badge-fake' : 'badge-suspicious';

        return `
            <tr onclick="viewReport(${n.id})" style="cursor: pointer;" title="Click to view details">
                <td>
                    <strong>${escapeHtml(n.title || 'Untitled')}</strong>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
                        ${n.sourceUrl ? `<a href="${n.sourceUrl}" target="_blank" onclick="event.stopPropagation()">${n.sourceUrl}</a>` : (n.platform || 'General')}
                    </div>
                </td>
                <td>${escapeHtml(n.platform || 'General')}</td>
                <td><span class="score-pill ${badgeClass}">${score}%</span></td>
                <td><span class="status-pill ${badgeClass}">${statusBadge}</span></td>
            </tr>
        `;
    }).join('');
}

function filterRecentNews(filter, btnElement) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    renderRecentNewsTable();
}

function viewReport(id) {
    const item = allRecentNews.find(n => n.id === id);
    if (!item) return;

    const modal = document.getElementById('reportModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    if (modalTitle) modalTitle.textContent = item.title || 'Analysis Report';
    if (modalBody) {
        const status = (item.status || 'SUSPICIOUS').toUpperCase();
        const score = Math.round(item.credibilityScore || 0);
        const explanation = item.explanation || (item.analysisDetails && item.analysisDetails.explanation) || 'Standard multi-factor AI verification performed.';

        modalBody.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <div>
                    <span class="status-pill ${status === 'REAL' ? 'badge-real' : status === 'FAKE' ? 'badge-fake' : 'badge-suspicious'}">
                        ${status === 'REAL' ? '✅ Real News' : status === 'FAKE' ? '❌ Fake News' : '⚠️ Suspicious'}
                    </span>
                    <span style="margin-left:8px; font-size:13px; color:#94a3b8;">${item.platform || 'General'}</span>
                </div>
                <div style="font-size: 24px; font-weight:700; color: ${status === 'REAL' ? '#10b981' : status === 'FAKE' ? '#ef4444' : '#f59e0b'};">
                    ${score}%
                </div>
            </div>
            <div style="margin-bottom: 16px;">
                <strong>Article Content / Extract:</strong>
                <p style="background: rgba(255,255,255,0.05); padding:12px; border-radius:8px; font-size:13px; color:#cbd5e1; max-height:150px; overflow-y:auto;">
                    ${escapeHtml(item.content || item.title || 'No content')}
                </p>
            </div>
            <div>
                <strong>Detailed AI Analysis Explanation:</strong>
                <pre style="white-space: pre-wrap; font-family: inherit; background: rgba(0,0,0,0.3); padding:12px; border-radius:8px; font-size:13px; color:#e2e8f0; border: 1px solid rgba(255,255,255,0.1);">
${escapeHtml(explanation)}
                </pre>
            </div>
        `;
    }

    if (modal) modal.style.display = 'flex';
}

function closeReportModal(event) {
    const modal = document.getElementById('reportModal');
    if (modal) modal.style.display = 'none';
}

function updateDashboardStats() {
    loadDashboardData();
}

function loadRecentNews() {
    showToast('🔄 Refreshing live data...', 'info');
    loadDashboardData();
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ============================================
// NAVBAR AUTH & USER WIDGET
// ============================================

function initNavbarAuth() {
    const token = getToken();
    const user = getUser();

    const navLoginBtn = document.getElementById('navLoginBtn');
    const navUserBadge = document.getElementById('navUserBadge');
    const navUsername = document.getElementById('navUsername');
    const navHistoryLink = document.getElementById('navHistoryLink');

    if (token && user) {
        if (navLoginBtn) navLoginBtn.style.display = 'none';
        if (navUserBadge) navUserBadge.style.display = 'inline-flex';
        if (navUsername) navUsername.textContent = `👤 ${user.fullName || user.username || 'User'}`;
        if (navHistoryLink) navHistoryLink.style.display = 'inline-block';
    } else {
        if (navLoginBtn) navLoginBtn.style.display = 'inline-block';
        if (navUserBadge) navUserBadge.style.display = 'none';
        if (navHistoryLink) navHistoryLink.style.display = 'none';
    }
}

// ============================================
// LANGUAGE SWITCHER & UI LOCALIZATION
// ============================================

let selectedLanguageCode = 'en';

const I18N_STRINGS = {
    en: {
        navAnalyze: "Analyze",
        navDashboard: "Dashboard",
        navHow: "How It Works",
        navAbout: "About",
        navHistory: "📜 My History",
        heroBadge: "AI-Powered Detection",
        heroTitle: "Detect Fake News<br><span class=\"gradient-text\">In Seconds</span>",
        heroSubtitle: "Advanced AI analyzes news articles, URLs, and images in real-time.",
        heroBtnAnalyze: "🔍 Analyze Now",
        heroBtnDashboard: "📊 View Dashboard",
        statAnalyzed: "Articles Analyzed",
        statFake: "Fake News Detected",
        statAccuracy: "Accuracy Rate",
        cardReal: "Verified Real",
        cardSuspicious: "Suspicious",
        cardFake: "Fake News",
        secAnalyzeTitle: "Analyze News",
        secAnalyzeSub: "Check text, URLs, or upload images to detect fake news",
        tabText: "📝 Text Analysis",
        tabUrl: "🔗 URL Analysis",
        tabImage: "🖼️ Image Analysis",
        lblHeadline: "News Headline",
        phHeadline: "Enter the news headline here...",
        lblContent: "News Content",
        phContent: "Paste the full article content here...",
        btnAnalyzeText: "🤖 Analyze Text",
        btnAnalyzeUrl: "🔗 Analyze URL",
        btnAnalyzeImage: "🖼️ Analyze Image",
        dropTitle: "Drop Image Here or Click to Upload",
        dashTitle: "Live Dashboard",
        dashSub: "Real-time tracking of analyzed news",
        dashTotal: "Total Analyzed",
        dashFake: "Fake News",
        dashReal: "Real News",
        dashSuspicious: "Suspicious",
        dashRecent: "📰 Recently Analyzed"
    },
    ta: {
        navAnalyze: "ஆராய்",
        navDashboard: "டாஷ்போர்டு",
        navHow: "எப்படி செயல்படுகிறது",
        navAbout: "பற்றி",
        navHistory: "📜 என் வரலாறு",
        heroBadge: "AI-இயங்கும் கண்டறிதல்",
        heroTitle: "போலி செய்திகளை கண்டறியுங்கள்<br><span class=\"gradient-text\">நொடிகளில்</span>",
        heroSubtitle: "செயற்கை நுண்ணறிவு மூலம் செய்திகள், இணைய இணைப்புகள் மற்றும் படங்களை துல்லியமாக சரிபார்க்கவும்.",
        heroBtnAnalyze: "🔍 இப்போதே ஆராயுங்கள்",
        heroBtnDashboard: "📊 டாஷ்போர்டு பார்க்க",
        statAnalyzed: "ஆராயப்பட்ட கட்டுரைகள்",
        statFake: "கண்டறியப்பட்ட போலி செய்தி",
        statAccuracy: "துல்லியம் விகிதம்",
        cardReal: "உண்மையான செய்தி",
        cardSuspicious: "சந்தேகத்திற்குரியது",
        cardFake: "போலி செய்தி",
        secAnalyzeTitle: "செய்தியை ஆராயுங்கள்",
        secAnalyzeSub: "போலி செய்திகளை கண்டறிய உரை, இணைய முகவரி அல்லது படங்களை பதிவேற்றவும்",
        tabText: "📝 உரை பகுப்பாய்வு",
        tabUrl: "🔗 URL பகுப்பாய்வு",
        tabImage: "🖼️ பட பகுப்பாய்வு",
        lblHeadline: "செய்தி தலைப்பு",
        phHeadline: "செய்தி தலைப்பை இங்கே உள்ளிடவும்...",
        lblContent: "செய்தி உள்ளடக்கம்",
        phContent: "முழு செய்திக் கட்டுரையை இங்கே ஒட்டவும்...",
        btnAnalyzeText: "🤖 உரையை ஆராயுங்கள்",
        btnAnalyzeUrl: "🔗 இணைப்பை ஆராயுங்கள்",
        btnAnalyzeImage: "🖼️ படத்தை ஆராயுங்கள்",
        dropTitle: "படத்தை இங்கே இழுத்துப் போடவும் அல்லது கிளிக் செய்யவும்",
        dashTitle: "நேரலை டாஷ்போர்டு",
        dashSub: "ஆராயப்பட்ட செய்திகளின் நிகழ்நேர புள்ளிவிவரங்கள்",
        dashTotal: "மொத்தம் ஆராயப்பட்டவை",
        dashFake: "போலி செய்திகள்",
        dashReal: "உண்மை செய்திகள்",
        dashSuspicious: "சந்தேகத்திற்குரியவை",
        dashRecent: "📰 சமீபத்திய பகுப்பாய்வு"
    },
    hi: {
        navAnalyze: "विश्लेषण",
        navDashboard: "डैशबोर्ड",
        navHow: "यह कैसे काम करता है",
        navAbout: "परिचय",
        navHistory: "📜 मेरा इतिहास",
        heroBadge: "AI-संचालित जांच",
        heroTitle: "फर्जी खबरों का पता लगाएं<br><span class=\"gradient-text\">चंद सेकंडों में</span>",
        heroSubtitle: "आर्टिफिशियल इंटेलिजेंस की मदद से खबरों, यूआरएल और तस्वीरों की तुरंत सत्यता जांचें।",
        heroBtnAnalyze: "🔍 अभी जांचें",
        heroBtnDashboard: "📊 डैशबोर्ड देखें",
        statAnalyzed: "कुल जांची गई खबरें",
        statFake: "फर्जी खबरें पकड़ी गईं",
        statAccuracy: "सटीकता दर",
        cardReal: "सत्यापित सच",
        cardSuspicious: "संदेहास्पद",
        cardFake: "फर्जी खबर",
        secAnalyzeTitle: "समाचार विश्लेषण",
        secAnalyzeSub: "टेक्स्ट, यूआरएल या फोटो अपलोड करके फेक न्यूज की जांच करें",
        tabText: "📝 टेक्स्ट विश्लेषण",
        tabUrl: "🔗 URL विश्लेषण",
        tabImage: "🖼️ फोटो विश्लेषण",
        lblHeadline: "समाचार शीर्षक",
        phHeadline: "खबर का शीर्षक यहां दर्ज करें...",
        lblContent: "समाचार विवरण",
        phContent: "पूरा समाचार यहां पेस्ट करें...",
        btnAnalyzeText: "🤖 टेक्स्ट की जांच करें",
        btnAnalyzeUrl: "🔗 URL की जांच करें",
        btnAnalyzeImage: "🖼️ फोटो की जांच करें",
        dropTitle: "फोटो यहां ड्रैग करें या क्लिक करके अपलोड करें",
        dashTitle: "लाइव डैशबोर्ड",
        dashSub: "विश्लेषण किए गए समाचारों की लाइव ट्रैकिंग",
        dashTotal: "कुल विश्लेषित",
        dashFake: "फर्जी खबरें",
        dashReal: "सच्ची खबरें",
        dashSuspicious: "संदेहास्पद",
        dashRecent: "📰 हाल ही में जांची गई खबरें"
    },
    es: {
        navAnalyze: "Analizar",
        navDashboard: "Panel",
        navHow: "Cómo Funciona",
        navAbout: "Acerca de",
        navHistory: "📜 Mi Historial",
        heroBadge: "Detección con IA",
        heroTitle: "Detecta Noticias Falsas<br><span class=\"gradient-text\">En Segundos</span>",
        heroSubtitle: "La IA avanzada analiza artículos de noticias, URLs e imágenes en tiempo real.",
        heroBtnAnalyze: "🔍 Analizar Ahora",
        heroBtnDashboard: "📊 Ver Panel",
        statAnalyzed: "Artículos Analizados",
        statFake: "Noticias Falsas Detectadas",
        statAccuracy: "Tasa de Precisión",
        cardReal: "Verificado Real",
        cardSuspicious: "Sospechoso",
        cardFake: "Noticia Falsa",
        secAnalyzeTitle: "Analizar Noticias",
        secAnalyzeSub: "Verifica texto, URLs o sube imágenes para detectar noticias falsas",
        tabText: "📝 Análisis de Texto",
        tabUrl: "🔗 Análisis de URL",
        tabImage: "🖼️ Análisis de Imagen",
        lblHeadline: "Titular de la Noticia",
        phHeadline: "Introduce el titular aquí...",
        lblContent: "Contenido de la Noticia",
        phContent: "Pega el artículo completo aquí...",
        btnAnalyzeText: "🤖 Analizar Texto",
        btnAnalyzeUrl: "🔗 Analizar URL",
        btnAnalyzeImage: "🖼️ Analizar Imagen",
        dropTitle: "Arrastra una imagen o haz clic para subir",
        dashTitle: "Panel en Vivo",
        dashSub: "Seguimiento en tiempo real de noticias analizadas",
        dashTotal: "Total Analizado",
        dashFake: "Noticias Falsas",
        dashReal: "Noticias Reales",
        dashSuspicious: "Sospechosas",
        dashRecent: "📰 Analizados Recientemente"
    },
    fr: {
        navAnalyze: "Analyser",
        navDashboard: "Tableau de Bord",
        navHow: "Comment ça marche",
        navAbout: "À propos",
        navHistory: "📜 Mon Historique",
        heroBadge: "Détection par IA",
        heroTitle: "Détectez les Fausses Nouvelles<br><span class=\"gradient-text\">En Quelques Secondes</span>",
        heroSubtitle: "L'IA analyse les articles, les URLs et les images en temps réel.",
        heroBtnAnalyze: "🔍 Analyser Maintenant",
        heroBtnDashboard: "📊 Voir le Tableau",
        statAnalyzed: "Articles Analysés",
        statFake: "Fausses Nouvelles Détectées",
        statAccuracy: "Taux de Précision",
        cardReal: "Vérifié Réel",
        cardSuspicious: "Suspect",
        cardFake: "Fausse Nouvelle",
        secAnalyzeTitle: "Analyser les Nouvelles",
        secAnalyzeSub: "Vérifiez du texte, des liens ou téléversez des images",
        tabText: "📝 Analyse de Texte",
        tabUrl: "🔗 Analyse d'URL",
        tabImage: "🖼️ Analyse d'Image",
        lblHeadline: "Titre de l'Article",
        phHeadline: "Entrez le titre ici...",
        lblContent: "Contenu de l'Article",
        phContent: "Collez le texte complet ici...",
        btnAnalyzeText: "🤖 Analyser le Texte",
        btnAnalyzeUrl: "🔗 Analyser l'URL",
        btnAnalyzeImage: "🖼️ Analyser l'Image",
        dropTitle: "Déposez une image ou cliquez pour téléverser",
        dashTitle: "Tableau de Bord",
        dashSub: "Suivi en temps réel des analyses",
        dashTotal: "Total Analysé",
        dashFake: "Fausses Nouvelles",
        dashReal: "Vraies Nouvelles",
        dashSuspicious: "Suspects",
        dashRecent: "📰 Récemment Analysé"
    },
    de: {
        navAnalyze: "Analysieren",
        navDashboard: "Dashboard",
        navHow: "So funktioniert's",
        navAbout: "Über uns",
        navHistory: "📜 Mein Verlauf",
        heroBadge: "KI-Erkennung",
        heroTitle: "Fake News Erkennen<br><span class=\"gradient-text\">In Sekundenschnelle</span>",
        heroSubtitle: "Fortschrittliche KI analysiert Nachrichten, URLs und Bilder in Echtzeit.",
        heroBtnAnalyze: "🔍 Jetzt Analysieren",
        heroBtnDashboard: "📊 Dashboard Öffnen",
        statAnalyzed: "Artikel Analysiert",
        statFake: "Fake News Erkannt",
        statAccuracy: "Genauigkeitsrate",
        cardReal: "Verifiziert Echt",
        cardSuspicious: "Verdächtig",
        cardFake: "Fake News",
        secAnalyzeTitle: "Nachrichten Prüfen",
        secAnalyzeSub: "Prüfen Sie Texte, URLs oder laden Sie Bilder hoch",
        tabText: "📝 Textanalyse",
        tabUrl: "🔗 URL-Analyse",
        tabImage: "🖼️ Bildanalyse",
        lblHeadline: "Schlagzeile",
        phHeadline: "Geben Sie die Schlagzeile hier ein...",
        lblContent: "Nachrichteninhalt",
        phContent: "Fügen Sie den Artikelinhalt hier ein...",
        btnAnalyzeText: "🤖 Text Analysieren",
        btnAnalyzeUrl: "🔗 URL Analysieren",
        btnAnalyzeImage: "🖼️ Bild Analysieren",
        dropTitle: "Bild hier ablegen oder zum Hochladen klicken",
        dashTitle: "Live-Dashboard",
        dashSub: "Echtzeit-Verfolgung geprüfter Nachrichten",
        dashTotal: "Gesamt Analysiert",
        dashFake: "Fake News",
        dashReal: "Echte News",
        dashSuspicious: "Verdächtig",
        dashRecent: "📰 Kürzlich Analysiert"
    }
};

function toggleLangDropdown() {
    const dropdown = document.getElementById('langDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
}

async function changeLanguage(code, flag, name) {
    selectedLanguageCode = code;
    const currentLang = document.getElementById('currentLang');
    if (currentLang) currentLang.textContent = `${flag} ${code.toUpperCase()}`;
    toggleLangDropdown();
    showToast(`🌐 Language set to ${name}`, 'info');

    applyUILanguage(code);

    // If an analysis explanation is currently visible on screen, translate it live!
    const explanationText = document.getElementById('explanationText');
    if (explanationText && explanationText.textContent && lastAnalyzedData) {
        const rawExplanation = lastAnalyzedData.explanation || (lastAnalyzedData.analysisDetails && lastAnalyzedData.analysisDetails.explanation);
        if (rawExplanation) {
            if (code === 'en') {
                explanationText.textContent = rawExplanation;
            } else {
                showToast(`Translating analysis explanation to ${name}...`, 'info');
                try {
                    const res = await fetch(`${API_URL}/api/language/translate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: rawExplanation, target: code })
                    });
                    if (res.ok) {
                        const trData = await res.json();
                        if (trData.translated) {
                            explanationText.textContent = trData.translated;
                            showToast(`✅ Translated analysis to ${name}!`, 'success');
                        }
                    }
                } catch (e) {
                    console.error('Translation failed:', e);
                }
            }
        }
    }
}

function applyUILanguage(langCode) {
    const dict = I18N_STRINGS[langCode] || I18N_STRINGS['en'];

    const setHtml = (selector, val) => {
        const el = document.querySelector(selector);
        if (el && val) el.innerHTML = val;
    };
    const setAttr = (selector, attr, val) => {
        const el = document.querySelector(selector);
        if (el && val) el.setAttribute(attr, val);
    };

    // Hero & Navbar
    setHtml('.nav-links a[href="#analyzer"]', dict.navAnalyze);
    setHtml('.nav-links a[href="#dashboard"]', dict.navDashboard);
    setHtml('.nav-links a[href="#how-it-works"]', dict.navHow);
    setHtml('.nav-links a[href="#about"]', dict.navAbout);
    setHtml('#navHistoryLink', dict.navHistory);
    setHtml('.hero-content .badge', `<span class="pulse-dot"></span> ${dict.heroBadge}`);
    setHtml('.hero-content h1', dict.heroTitle);
    setHtml('.hero-subtitle', dict.heroSubtitle);
    setHtml('.hero-buttons .btn-primary', dict.heroBtnAnalyze);
    setHtml('.hero-buttons .btn-secondary', dict.heroBtnDashboard);

    // Floating cards
    setHtml('.card-real .card-title', dict.cardReal);
    setHtml('.card-suspicious .card-title', dict.cardSuspicious);
    setHtml('.card-fake .card-title', dict.cardFake);

    // Analyzer section
    setHtml('.analyzer-section .section-header h2', dict.secAnalyzeTitle);
    setHtml('.analyzer-section .section-header p', dict.secAnalyzeSub);
    setHtml('.analyzer-tabs .tab-btn:nth-child(1)', dict.tabText);
    setHtml('.analyzer-tabs .tab-btn:nth-child(2)', dict.tabUrl);
    setHtml('.analyzer-tabs .tab-btn:nth-child(3)', dict.tabImage);

    // Form inputs
    setAttr('#newsTitle', 'placeholder', dict.phHeadline);
    setAttr('#newsContent', 'placeholder', dict.phContent);
    setHtml('#btnText', dict.btnAnalyzeText);
    setHtml('#btnUrlText', dict.btnAnalyzeUrl);
    setHtml('#btnImageText', dict.btnAnalyzeImage);
    setHtml('#uploadContent h3', dict.dropTitle);

    // Dashboard
    setHtml('.dashboard-section .section-header h2', dict.dashTitle);
    setHtml('.dashboard-section .section-header p', dict.dashSub);
    setHtml('.card-total .card-label', dict.dashTotal);
    setHtml('.card-fake .card-label', dict.dashFake);
    setHtml('.card-real .card-label', dict.dashReal);
    setHtml('.card-suspicious .card-label', dict.dashSuspicious);
    setHtml('.recent-news-header h3', dict.dashRecent);
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
    initNavbarAuth();
    loadDashboardData();
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
window.downloadReport = downloadReport;
window.analyzeAnother = analyzeAnother;
window.loadRecentNews = loadRecentNews;
window.toggleLangDropdown = toggleLangDropdown;
window.changeLanguage = changeLanguage;
window.loadSample = loadSample;
window.filterRecentNews = filterRecentNews;
window.viewReport = viewReport;
window.closeReportModal = closeReportModal;
window.logout = logout;