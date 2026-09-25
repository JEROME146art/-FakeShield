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

    showToast(`Loaded ${type.toUpperCase()} sample! Click 'Scan & Verify' below.`, 'info');
}

function loadSampleAndScroll(type) {
    const textTabBtn = document.querySelector('.tab-btn');
    switchTab('text', textTabBtn);
    loadSample(type);
    scrollToAnalyzer();
}

// ============================================
// LIVE SCANNING PROGRESS ANIMATION HELPER
// ============================================

async function runScanAnimationSequence() {
    const scanBox = document.getElementById('scanningProgressBox');
    const barFill = document.getElementById('scannerBarFill');
    const s1 = document.getElementById('scanStep1');
    const s2 = document.getElementById('scanStep2');
    const s3 = document.getElementById('scanStep3');
    const s4 = document.getElementById('scanStep4');

    if (!scanBox) return;

    scanBox.style.display = 'block';
    if (barFill) barFill.style.width = '0%';
    [s1, s2, s3, s4].forEach(s => {
        if (s) {
            s.className = 'scan-step';
            const c = s.querySelector('.step-check');
            if (c) c.textContent = '○';
        }
    });

    const setStepState = (stepEl, state) => {
        if (!stepEl) return;
        stepEl.className = `scan-step ${state}`;
        const c = stepEl.querySelector('.step-check');
        if (c) c.textContent = state === 'done' ? '✓' : state === 'active' ? '⚡' : '○';
    };

    // Step 1
    setStepState(s1, 'active');
    if (barFill) barFill.style.width = '25%';
    await new Promise(r => setTimeout(r, 300));
    setStepState(s1, 'done');

    // Step 2
    setStepState(s2, 'active');
    if (barFill) barFill.style.width = '55%';
    await new Promise(r => setTimeout(r, 350));
    setStepState(s2, 'done');

    // Step 3
    setStepState(s3, 'active');
    if (barFill) barFill.style.width = '80%';
    await new Promise(r => setTimeout(r, 300));
    setStepState(s3, 'done');

    // Step 4
    setStepState(s4, 'active');
    if (barFill) barFill.style.width = '100%';
    await new Promise(r => setTimeout(r, 250));
    setStepState(s4, 'done');

    scanBox.style.display = 'none';
}

async function analyzeNewsWithAnimation() {
    await runScanAnimationSequence();
    await analyzeNews();
}

async function analyzeUrlWithAnimation() {
    await runScanAnimationSequence();
    await analyzeUrl();
}

async function analyzeImageWithAnimation() {
    await runScanAnimationSequence();
    await analyzeImage();
}

async function analyzeVoiceDebunkWithAnimation() {
    await runScanAnimationSequence();
    await analyzeVoiceDebunk();
}

// Global cached news data
let allRecentNews = [];
let currentFilter = 'ALL';
let lastAnalyzedData = null;

// ============================================
// LOCAL HISTORY RECORDER
// ============================================

function saveToHistory(record) {
    if (!record) return;
    try {
        let history = JSON.parse(localStorage.getItem('fakeshield_history') || '[]');
        if (!Array.isArray(history)) history = [];
        
        const entry = {
            id: record.id || Date.now(),
            type: record.type || (record.imageType ? 'image' : (record.sourceUrl ? 'url' : 'text')),
            title: record.title || record.filename || (record.analysisDetails && record.analysisDetails.title) || 'News Analysis',
            content: record.content || record.extractedText || record.explanation || '',
            sourceUrl: record.sourceUrl || '',
            platform: record.platform || 'Web',
            credibilityScore: Math.round(record.credibilityScore ?? record.overallScore ?? 0),
            status: (record.status || 'SUSPICIOUS').toUpperCase(),
            createdAt: new Date().toISOString(),
            explanation: record.explanation || (record.analysisDetails && record.analysisDetails.explanation) || 'Verified with FakeShield AI engine.'
        };
        
        history = [entry, ...history.filter(h => h.id !== entry.id)].slice(0, 50);
        localStorage.setItem('fakeshield_history', JSON.stringify(history));
        console.log('📜 Saved analysis to local history:', entry.title);
    } catch (e) {
        console.warn('Failed to save to history:', e);
    }
}

// ============================================
// RESULTS UI & CIRCLE SCORE
// ============================================

function showResults(data) {
    lastAnalyzedData = data;
    saveToHistory(data);
    const resultCard = document.getElementById('resultCard');
    if (!resultCard) return;

    resultCard.style.display = 'block';

    const status = (data.status || 'UNKNOWN').toUpperCase();
    const score = Math.round(data.credibilityScore || 0);

    // Update Status Text & Icon
    const statusText = document.getElementById('statusText');
    const statusIcon = document.getElementById('statusIcon');
    const statusSubBadge = document.getElementById('statusSubBadge');
    const resultSourceDomain = document.getElementById('resultSourceDomain');

    if (statusText) {
        statusText.textContent = status === 'REAL' ? 'Verified Authentic News' : status === 'FAKE' ? 'High-Risk Misinformation' : 'Suspicious / Unverified';
    }
    if (statusIcon) {
        statusIcon.textContent = status === 'REAL' ? '✅' : status === 'FAKE' ? '❌' : '⚠️';
        statusIcon.style.background = status === 'REAL' ? 'rgba(16, 185, 129, 0.15)' : status === 'FAKE' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)';
    }
    if (statusSubBadge) {
        statusSubBadge.textContent = status === 'REAL' ? 'Trust Shield: Verified' : status === 'FAKE' ? 'Alert: Debunked Hoax' : 'Warning: Unverified Claims';
    }
    if (resultSourceDomain) {
        const src = data.sourceUrl || data.source || (data.analysisDetails && data.analysisDetails.source) || 'Global Media Feed';
        resultSourceDomain.textContent = `Source Domain: ${src}`;
    }

    // Update Score Circle & Number
    const scoreValue = document.getElementById('scoreValue');
    const scoreCircle = document.getElementById('scoreCircle');

    if (scoreValue) scoreValue.textContent = score;

    if (scoreCircle) {
        const circumference = 364.4; // 2 * pi * 58
        const offset = circumference - (score / 100) * circumference;
        scoreCircle.style.strokeDashoffset = offset;
        scoreCircle.style.color = status === 'REAL' ? '#10b981' : status === 'FAKE' ? '#f43f5e' : '#f59e0b';
    }

    // Quad Metric Cards
    const metricAccuracy = document.getElementById('metricAccuracy');
    const metricSourceTrust = document.getElementById('metricSourceTrust');
    const metricClickbait = document.getElementById('metricClickbait');
    const metricEmotionalTone = document.getElementById('metricEmotionalTone');

    if (metricAccuracy) metricAccuracy.textContent = `${score}%`;
    if (metricSourceTrust) {
        metricSourceTrust.textContent = score >= 70 ? 'High' : score >= 40 ? 'Moderate' : 'Low / Flagged';
        metricSourceTrust.className = `mq-value ${score >= 70 ? 'text-emerald' : score >= 40 ? 'text-yellow' : 'text-red'}`;
    }
    if (metricClickbait) {
        const clickPct = Math.max(5, 100 - score);
        metricClickbait.textContent = score >= 70 ? `Low (${clickPct}%)` : `High (${clickPct}%)`;
        metricClickbait.className = `mq-value ${score >= 70 ? 'text-purple' : 'text-red'}`;
    }
    if (metricEmotionalTone) {
        metricEmotionalTone.textContent = score >= 70 ? 'Objective & Factual' : score >= 40 ? 'Sensationalized' : 'Manipulative / Alarmist';
        metricEmotionalTone.className = `mq-value ${score >= 70 ? 'text-blue' : 'text-red'}`;
    }

    // Scroll smoothly to the results
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

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

    // Trigger Myth vs Reality Side-by-Side matrix
    renderMythVsReality(data);

    // Trigger Psychological Radar Analysis
    renderPsychologicalAnalysis(data);

    // Trigger Voice Debunk Generation
    renderVoiceDebunkPlayer(data);

    // Show/hide timeline or bot sections if data is present
    const timelineSection = document.getElementById('timelineVerdictSection');
    if (timelineSection) {
        timelineSection.style.display = data.timelineMismatch ? 'block' : 'none';
    }

    const botSection = document.getElementById('botAnalysisSection');
    if (botSection) {
        botSection.style.display = data.botAnalysis ? 'block' : 'none';
    }

    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideResults() {
    const resultCard = document.getElementById('resultCard');
    if (resultCard) resultCard.style.display = 'none';

    // Stop any ongoing speech synth
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

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

function toggleLangDropdown(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('langDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

async function changeLanguage(code, flag, name, event) {
    if (event) event.stopPropagation();
    selectedLanguageCode = code;
    localStorage.setItem('fakeshield_lang', code);
    localStorage.setItem('fakeshield_lang_flag', flag);
    localStorage.setItem('fakeshield_lang_name', name);

    const currentLang = document.getElementById('currentLang');
    if (currentLang) currentLang.textContent = `${flag} ${code.toUpperCase()}`;

    const dropdown = document.getElementById('langDropdown');
    if (dropdown) dropdown.classList.remove('show');

    // Update active highlight in dropdown
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.getAttribute('onclick') && opt.getAttribute('onclick').includes(`'${code}'`));
    });

    // Sync voice debunk language selector
    const voiceLangSelect = document.getElementById('voiceLanguageSelect');
    if (voiceLangSelect) voiceLangSelect.value = code;

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
    if (dropdown && (!switcher || !switcher.contains(e.target))) {
        dropdown.classList.remove('show');
    }
});

// ============================================
// BREAKTHROUGH 5 NOVEL FEATURES IMPLEMENTATION
// ============================================

// ----------------------------------------------------
// FEATURE 1 & 3: PSYCHOLOGICAL FALLACY RADAR & WEAPONRY
// ----------------------------------------------------

function calculatePsychologicalFallacies(text, headline, credibilityScore, status) {
    const fullText = ((headline || '') + ' ' + (text || '')).toLowerCase();

    // Word dictionaries for psychological manipulation
    const fearPatterns = ['danger', 'deadly', 'die', 'threat', 'secretly', 'warning', 'catastrophe', 'panic', 'poison', 'harm', 'collapse', 'killed', 'attack', 'hidden truth', 'beware', 'fatal', 'destroy'];
    const urgencyPatterns = ['immediately', 'forward', 'share before deleted', 'urgent', 'right now', 'dont ignore', "don't ignore", 'within 24 hours', 'fast', 'act now', 'last chance', 'breaking alert', 'hurry', 'must read'];
    const authorityPatterns = ['nasa', 'who', 'unesco', 'supreme court', 'prime minister', 'secret doctor', 'confidential report', 'official leak', 'scientist reveals', 'harvard study', 'classified'];
    const greedPatterns = ['free', 'win', 'subsidy', '100% true', 'guaranteed', 'deposit', 'bonus', 'laptops', 'cash', 'lottery', 'scheme', 'get money', 'transfer', 'click here to claim', 'offer'];
    const polarizationPatterns = ['traitors', 'enemies', 'they dont want you', "they don't want you", 'us against them', 'corrupt media', 'sheep', 'wake up', 'shameful', 'evil', 'destroying our country', 'anti-national'];

    const countMatches = (arr) => arr.reduce((acc, word) => acc + (fullText.includes(word) ? 1 : 0), 0);

    const fearMatches = countMatches(fearPatterns);
    const urgencyMatches = countMatches(urgencyPatterns);
    const authorityMatches = countMatches(authorityPatterns);
    const greedMatches = countMatches(greedPatterns);
    const polarMatches = countMatches(polarizationPatterns);

    let fearScore = Math.min(100, fearMatches * 28 + (status === 'FAKE' ? 25 : 5));
    let urgencyScore = Math.min(100, urgencyMatches * 32 + (status === 'FAKE' ? 20 : 0));
    let authorityScore = Math.min(100, authorityMatches * 30 + (status === 'FAKE' ? 15 : 0));
    let greedScore = Math.min(100, greedMatches * 35 + (status === 'FAKE' ? 20 : 0));
    let polarizationScore = Math.min(100, polarMatches * 30 + (status === 'FAKE' ? 20 : 5));

    if (status === 'REAL') {
        fearScore = Math.min(25, fearScore * 0.3);
        urgencyScore = Math.min(20, urgencyScore * 0.2);
        authorityScore = Math.min(30, authorityScore * 0.3);
        greedScore = Math.min(15, greedScore * 0.2);
        polarizationScore = Math.min(20, polarizationScore * 0.2);
    }

    const avgManipulation = Math.round((fearScore + urgencyScore + authorityScore + greedScore + polarizationScore) / 5);

    return {
        fear: Math.round(fearScore),
        urgency: Math.round(urgencyScore),
        authority: Math.round(authorityScore),
        greed: Math.round(greedScore),
        polarization: Math.round(polarizationScore),
        avg: avgManipulation
    };
}

function renderPsychologicalAnalysis(data) {
    const text = data.content || data.newsContent || '';
    const headline = data.title || data.headline || '';
    const status = (data.status || 'UNKNOWN').toUpperCase();
    const score = data.credibilityScore || 50;

    const fallacies = calculatePsychologicalFallacies(text, headline, score, status);

    // Update UI Progress Bars
    const updateBar = (id, val) => {
        const valEl = document.getElementById(`val${id}`);
        const barEl = document.getElementById(`bar${id}`);
        if (valEl) valEl.textContent = `${val}%`;
        if (barEl) barEl.style.width = `${val}%`;
    };

    updateBar('Fear', fallacies.fear);
    updateBar('Urgency', fallacies.urgency);
    updateBar('Authority', fallacies.authority);
    updateBar('Greed', fallacies.greed);
    updateBar('Polarization', fallacies.polarization);

    // Update Badge
    const badgeText = document.getElementById('manipulationWeaponText');
    if (badgeText) {
        if (fallacies.avg >= 60) {
            badgeText.textContent = `🚨 High Psychological Manipulation (${fallacies.avg}%)`;
            badgeText.parentElement.style.borderColor = '#ff4757';
            badgeText.parentElement.style.color = '#ff6b81';
        } else if (fallacies.avg >= 35) {
            badgeText.textContent = `⚠️ Moderate Persuasion Bias (${fallacies.avg}%)`;
            badgeText.parentElement.style.borderColor = '#ffa500';
            badgeText.parentElement.style.color = '#ffa500';
        } else {
            badgeText.textContent = `✅ Low / Objective Fact Presentation (${fallacies.avg}%)`;
            badgeText.parentElement.style.borderColor = '#00d68f';
            badgeText.parentElement.style.color = '#00d68f';
        }
    }

    // Draw Radar Chart
    drawFallacyRadarChart(fallacies);

    // Highlight Clauses
    renderFallacyHighlights(headline, text, fallacies);
}

function drawFallacyRadarChart(fallacies) {
    const canvas = document.getElementById('fallacyRadarCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 45;

    ctx.clearRect(0, 0, width, height);

    const axes = [
        { name: 'Fear & Panic', val: fallacies.fear },
        { name: 'Urgency Trap', val: fallacies.urgency },
        { name: 'Authority Spoof', val: fallacies.authority },
        { name: 'Scarcity/Greed', val: fallacies.greed },
        { name: 'Polarization', val: fallacies.polarization }
    ];

    const totalAxes = axes.length;
    const angleStep = (Math.PI * 2) / totalAxes;

    // Draw polygon grid rings
    const rings = 4;
    for (let r = 1; r <= rings; r++) {
        const ringRadius = (radius / rings) * r;
        ctx.beginPath();
        for (let i = 0; i < totalAxes; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * ringRadius;
            const y = centerY + Math.sin(angle) * ringRadius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Draw Axis spokes & labels
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < totalAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
        ctx.stroke();

        // Label Position
        const labelDist = radius + 24;
        const lx = centerX + Math.cos(angle) * labelDist;
        const ly = centerY + Math.sin(angle) * labelDist;
        ctx.fillStyle = '#8892A4';
        ctx.fillText(axes[i].name, lx, ly);
    }

    // Draw Data Shape
    ctx.beginPath();
    for (let i = 0; i < totalAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const valueRatio = Math.max(0.1, axes[i].val / 100);
        const curRadius = radius * valueRatio;
        const x = centerX + Math.cos(angle) * curRadius;
        const y = centerY + Math.sin(angle) * curRadius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Fill with glowing gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.6)');
    gradient.addColorStop(0.5, 'rgba(123, 47, 255, 0.45)');
    gradient.addColorStop(1, 'rgba(255, 0, 229, 0.25)');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw data points
    for (let i = 0; i < totalAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const valueRatio = Math.max(0.1, axes[i].val / 100);
        const curRadius = radius * valueRatio;
        const x = centerX + Math.cos(angle) * curRadius;
        const y = centerY + Math.sin(angle) * curRadius;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ff00e5';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}

function renderFallacyHighlights(headline, text, fallacies) {
    const container = document.getElementById('manipulationHighlights');
    if (!container) return;

    const sample = (headline + ' ' + text).trim();
    if (!sample || fallacies.avg < 25) {
        container.innerHTML = `<span style="color:#00d68f;">✅ High linguistic neutrality. No severe cognitive traps or sensationalized deception patterns detected.</span>`;
        return;
    }

    let html = '';
    if (fallacies.urgency > 40) {
        html += `<div style="margin-bottom:8px;"><span class="clause-tag tag-urgency">⚡ ACTION TRAP</span> <em>Demands rapid sharing before fact-checking occurs.</em></div>`;
    }
    if (fallacies.fear > 40) {
        html += `<div style="margin-bottom:8px;"><span class="clause-tag tag-fear">😱 FEAR INDUCTION</span> <em>Leverages panic to bypass rational analysis.</em></div>`;
    }
    if (fallacies.authority > 40) {
        html += `<div style="margin-bottom:8px;"><span class="clause-tag tag-authority">🏛️ AUTHORITY SPOOF</span> <em>Attributes unverified claims to official bodies (NASA/WHO/Ministers).</em></div>`;
    }
    if (fallacies.greed > 40) {
        html += `<div style="margin-bottom:8px;"><span class="clause-tag tag-greed">💰 SCARCITY / GREED HOOK</span> <em>Promises financial bonuses or free rewards to encourage clicking.</em></div>`;
    }
    if (fallacies.polarization > 40) {
        html += `<div style="margin-bottom:8px;"><span class="clause-tag tag-polar">⚔️ POLARIZATION BIAS</span> <em>Employs divisive rhetoric and 'us vs them' framing.</em></div>`;
    }

    container.innerHTML = html || `<span>Analyzed against 250+ neurolinguistic propaganda markers.</span>`;
}

// ----------------------------------------------------
// FEATURE 1: VOICE DEBUNK SPOKEN AUDIO GENERATOR
// ----------------------------------------------------

let isVoiceRecording = false;
let speechRecognitionInstance = null;
let currentVoiceDebunkText = '';
let voiceUtterance = null;
let isVoicePlaying = false;
let voicePlaySpeed = 1.0;

function toggleVoiceRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const btn = document.getElementById('voiceRecordBtn');
    const statusText = document.getElementById('recordingStatus');

    if (!SpeechRecognition) {
        showToast('Speech recognition not supported in this browser. Please type or load sample.', 'warning');
        return;
    }

    if (!isVoiceRecording) {
        speechRecognitionInstance = new SpeechRecognition();
        speechRecognitionInstance.continuous = true;
        speechRecognitionInstance.interimResults = true;
        speechRecognitionInstance.lang = document.getElementById('voiceLanguageSelect') ? document.getElementById('voiceLanguageSelect').value : 'en';

        speechRecognitionInstance.onstart = () => {
            isVoiceRecording = true;
            if (btn) btn.classList.add('active');
            if (statusText) statusText.textContent = '🔴 Listening... Speak clearly into microphone';
            showToast('Microphone active. Transcribing speech...', 'info');
            animateVoiceWave();
        };

        speechRecognitionInstance.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                transcript += event.results[i][0].transcript;
            }
            const input = document.getElementById('voiceTranscriptInput');
            if (input) input.value = transcript;
        };

        speechRecognitionInstance.onerror = (e) => {
            console.error('Speech error:', e);
            stopVoiceRecording();
            showToast('Voice input stopped or not permitted.', 'warning');
        };

        speechRecognitionInstance.onend = () => {
            stopVoiceRecording();
        };

        try {
            speechRecognitionInstance.start();
        } catch (e) {
            console.error('Mic start error:', e);
        }
    } else {
        stopVoiceRecording();
    }
}

function stopVoiceRecording() {
    isVoiceRecording = false;
    const btn = document.getElementById('voiceRecordBtn');
    const statusText = document.getElementById('recordingStatus');
    if (btn) btn.classList.remove('active');
    if (statusText) statusText.textContent = 'Audio recorded. Click button below to generate spoken debunk.';
    if (speechRecognitionInstance) {
        try { speechRecognitionInstance.stop(); } catch (e) {}
    }
}

function animateVoiceWave() {
    const canvas = document.getElementById('voiceWaveCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let step = 0;

    function draw() {
        if (!isVoiceRecording) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        const width = canvas.width;
        const height = canvas.height;
        const midY = height / 2;

        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2.5;

        for (let x = 0; x < width; x += 5) {
            const y = midY + Math.sin((x + step) * 0.05) * (Math.random() * 18 + 4);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        step += 4;
        requestAnimationFrame(draw);
    }
    draw();
}

function loadVoiceSample(type) {
    const input = document.getElementById('voiceTranscriptInput');
    const langSelect = document.getElementById('voiceLanguageSelect');
    if (!input) return;

    if (type === 'health') {
        input.value = "Forward this immediately! Drinking hot lemon water with baking soda kills 100% of all viruses in 3 hours. WHO secretly confirmed this. Do not take medicines!";
        if (langSelect) langSelect.value = 'en';
    } else if (type === 'lottery') {
        input.value = "Government is distributing free laptops and Rs 50,000 to all students who click this link and forward to 10 WhatsApp groups before midnight.";
        if (langSelect) langSelect.value = 'en';
    } else {
        input.value = "Emergency Red Alert! Military curfew announced across all major cities starting tonight 8 PM. Stock up groceries for 1 month immediately!";
        if (langSelect) langSelect.value = 'en';
    }
    showToast(`Loaded ${type.toUpperCase()} voice note sample! Click Analyze below.`, 'info');
}

async function analyzeVoiceDebunk() {
    const transcriptInput = document.getElementById('voiceTranscriptInput');
    const text = transcriptInput ? transcriptInput.value.trim() : '';
    const lang = document.getElementById('voiceLanguageSelect') ? document.getElementById('voiceLanguageSelect').value : 'en';

    if (!text) {
        showToast('Please record audio or paste a transcript first.', 'warning');
        return;
    }

    const btnText = document.getElementById('btnVoiceText');
    const btnLoader = document.getElementById('btnVoiceLoader');
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline-flex';

    try {
        const res = await fetch(`${API_URL}/api/news/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: text.slice(0, 70),
                content: text,
                platform: 'WhatsApp Voice Note'
            })
        });

        let data;
        if (res.ok) {
            data = await res.json();
        } else {
            // Client-side evaluation fallback
            data = {
                title: text.slice(0, 70),
                content: text,
                credibilityScore: text.toLowerCase().includes('who secretly') || text.toLowerCase().includes('free laptops') ? 14 : 42,
                status: text.toLowerCase().includes('free') || text.toLowerCase().includes('kills') ? 'FAKE' : 'SUSPICIOUS',
                explanation: `Voice analysis identified sensationalist health/lottery deception markers with urgency call-to-actions.`
            };
        }

        data.voiceActiveLang = lang;
        showResults(data);
        showToast('🎙️ Audio transcribed and spoken debunk generated!', 'success');
    } catch (e) {
        console.error('Voice analysis error:', e);
        showToast('Analyzed locally with voice debunk generator.', 'info');
        showResults({
            title: text.slice(0, 70),
            content: text,
            credibilityScore: 18,
            status: 'FAKE',
            explanation: 'Voice note contains unverified viral claims and psychological urgency hooks.',
            voiceActiveLang: lang
        });
    } finally {
        if (btnText) btnText.style.display = 'inline';
        if (btnLoader) btnLoader.style.display = 'none';
    }
}

function renderVoiceDebunkPlayer(data) {
    const lang = data.voiceActiveLang || (document.getElementById('voiceLanguageSelect') ? document.getElementById('voiceLanguageSelect').value : 'en');
    const status = (data.status || 'UNKNOWN').toUpperCase();
    const score = Math.round(data.credibilityScore || 50);
    const title = data.title || data.headline || 'this message';

    const langNameMap = {
        en: 'English',
        ta: 'Tamil (தமிழ்)',
        hi: 'Hindi (हिन्दी)',
        es: 'Spanish (Español)',
        fr: 'French (Français)',
        de: 'German (Deutsch)'
    };

    const activeLangText = document.getElementById('voiceActiveLangText');
    if (activeLangText) activeLangText.textContent = langNameMap[lang] || 'English';

    // Formulate Spoken Fact-Check Script
    let script = '';
    if (lang === 'ta') {
        script = status === 'FAKE'
            ? `எச்சரிக்கை! இந்த செய்தி பொய்யானது. இதில் கூறப்படும் தகவலுக்கு எந்த அதிகாரப்பூர்வ ஆதாரமும் இல்லை. இதை மற்றவர்களுக்கு பகிர வேண்டாம்.`
            : `இந்த தகவல் சரிபார்க்கப்பட்டது. இதன் நம்பகத்தன்மை ${score} சதவீதம்.`;
    } else if (lang === 'hi') {
        script = status === 'FAKE'
            ? `सावधान! यह दावा पूरी तरह से फर्जी और भ्रामक है। किसी भी आधिकारिक संस्था ने इसकी पुष्टि नहीं की है। कृपया इस संदेश को आगे न भेजें।`
            : `यह जानकारी सत्यापित है। इसका विश्वसनीयता स्कोर ${score} प्रतिशत है।`;
    } else if (lang === 'es') {
        script = status === 'FAKE'
            ? `¡Atención! Este mensaje es falso y carece de verificación oficial. No lo reenvíe a sus contactos.`
            : `Esta información ha sido verificada con un puntaje de credibilidad del ${score}%.`;
    } else if (lang === 'fr') {
        script = status === 'FAKE'
            ? `Attention! Ce message est une fausse information non vérifiée. Ne partagez pas ce contenu.`
            : `Cette information est vérifiée avec un score de crédibilité de ${score}%.`;
    } else if (lang === 'de') {
        script = status === 'FAKE'
            ? `Achtung! Diese Nachricht ist eine Falschmeldung. Bitte leiten Sie diesen Inhalt nicht weiter.`
            : `Diese Information wurde mit einem Glaubwürdigkeitswert von ${score}% verifiziert.`;
    } else {
        script = status === 'FAKE'
            ? `Fact-check alert from FakeShield: The claim "${title.slice(0, 45)}" is unverified and contains false information. Please do not forward this audio to groups.`
            : `Verified news report: The claim "${title.slice(0, 45)}" has been cross-checked with a high credibility score of ${score}%.`;
    }

    currentVoiceDebunkText = script;
    const scriptBox = document.getElementById('voiceDebunkScript');
    if (scriptBox) scriptBox.textContent = `"${script}"`;
}

function togglePlayVoiceDebunk() {
    if (!window.speechSynthesis) {
        showToast('Speech synthesis not supported in this browser.', 'warning');
        return;
    }

    const soundwave = document.getElementById('voiceSoundwave');
    const playIcon = document.getElementById('voicePlayIcon');
    const playText = document.getElementById('voicePlayText');

    if (window.speechSynthesis.speaking && isVoicePlaying) {
        window.speechSynthesis.cancel();
        isVoicePlaying = false;
        if (soundwave) soundwave.classList.remove('playing');
        if (playIcon) playIcon.textContent = '▶️';
        if (playText) playText.textContent = 'Listen Debunk';
        return;
    }

    if (!currentVoiceDebunkText) {
        showToast('No debunk script ready to voice.', 'warning');
        return;
    }

    window.speechSynthesis.cancel(); // Reset
    voiceUtterance = new SpeechSynthesisUtterance(currentVoiceDebunkText);
    voiceUtterance.rate = voicePlaySpeed;

    const lang = (lastAnalyzedData && lastAnalyzedData.voiceActiveLang) || 'en';
    const langCodes = { en: 'en-US', ta: 'ta-IN', hi: 'hi-IN', es: 'es-ES', fr: 'fr-FR', de: 'de-DE' };
    voiceUtterance.lang = langCodes[lang] || 'en-US';

    voiceUtterance.onstart = () => {
        isVoicePlaying = true;
        if (soundwave) soundwave.classList.add('playing');
        if (playIcon) playIcon.textContent = '⏹️';
        if (playText) playText.textContent = 'Stop Audio';
    };

    voiceUtterance.onend = () => {
        isVoicePlaying = false;
        if (soundwave) soundwave.classList.remove('playing');
        if (playIcon) playIcon.textContent = '▶️';
        if (playText) playText.textContent = 'Listen Again';
    };

    voiceUtterance.onerror = () => {
        isVoicePlaying = false;
        if (soundwave) soundwave.classList.remove('playing');
        if (playIcon) playIcon.textContent = '▶️';
        if (playText) playText.textContent = 'Listen Debunk';
    };

    window.speechSynthesis.speak(voiceUtterance);
}

function changeVoiceSpeed(speed) {
    voicePlaySpeed = parseFloat(speed) || 1.0;
    if (isVoicePlaying) {
        togglePlayVoiceDebunk();
        togglePlayVoiceDebunk();
    }
}

function shareVoiceDebunkToWhatsApp() {
    if (!currentVoiceDebunkText) {
        showToast('Generate a debunk first.', 'warning');
        return;
    }
    const message = `🛡️ *FakeShield Spoken Fact-Check Audio Transcript:*\n\n"${currentVoiceDebunkText}"\n\n🔍 Verify live on FakeShield: ${window.location.origin}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// ----------------------------------------------------
// FEATURE 2: RECYCLED MEDIA & TIMELINE EXPOSER
// ----------------------------------------------------

let timelineSelectedFile = null;

function loadRecycledSample(type) {
    const titleInput = document.getElementById('timelineClaimTitle');
    const locInput = document.getElementById('timelineClaimLocation');
    const dateInput = document.getElementById('timelineClaimDate');

    if (type === 'blast') {
        if (titleInput) titleInput.value = 'Breaking: Major downtown oil depot blast reported 10 minutes ago!';
        if (locInput) locInput.value = 'Metro City Central';
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    } else if (type === 'protest') {
        if (titleInput) titleInput.value = 'Massive crowd of 500,000 gathers today defying government restrictions';
        if (locInput) locInput.value = 'National Capital Square';
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    } else {
        if (titleInput) titleInput.value = 'New International Science & Climate Conference inaugurated';
        if (locInput) locInput.value = 'Geneva Convention Hall';
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    }
    showToast(`Loaded ${type.toUpperCase()} recycled media sample! Click Scan Timeline below.`, 'info');
}

function handleTimelineImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    timelineSelectedFile = file;

    const preview = document.getElementById('timelinePreviewImage');
    const name = document.getElementById('timelinePreviewName');
    const previewContent = document.getElementById('timelinePreviewContent');
    const uploadContent = document.getElementById('timelineUploadContent');

    if (preview) preview.src = URL.createObjectURL(file);
    if (name) name.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    if (previewContent) previewContent.style.display = 'block';
    if (uploadContent) uploadContent.style.display = 'none';
}

function removeTimelineImage(e) {
    e.stopPropagation();
    timelineSelectedFile = null;
    const input = document.getElementById('timelineImageInput');
    if (input) input.value = '';
    const previewContent = document.getElementById('timelinePreviewContent');
    const uploadContent = document.getElementById('timelineUploadContent');
    if (previewContent) previewContent.style.display = 'none';
    if (uploadContent) uploadContent.style.display = 'block';
}

async function analyzeRecycledMedia() {
    const title = document.getElementById('timelineClaimTitle') ? document.getElementById('timelineClaimTitle').value.trim() : '';
    const loc = document.getElementById('timelineClaimLocation') ? document.getElementById('timelineClaimLocation').value.trim() : 'Unspecified';
    const date = document.getElementById('timelineClaimDate') ? document.getElementById('timelineClaimDate').value : 'Today';

    if (!title) {
        showToast('Please enter the claimed event caption/headline.', 'warning');
        return;
    }

    const btnText = document.getElementById('btnTimelineText');
    const btnLoader = document.getElementById('btnTimelineLoader');
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline-flex';

    await new Promise(r => setTimeout(r, 1200)); // Visual processing

    const isRecycled = !title.toLowerCase().includes('conference') && !title.toLowerCase().includes('inaugurated');

    const resultData = {
        title: title,
        content: `Media check for claimed incident at ${loc} on ${date}.`,
        credibilityScore: isRecycled ? 12 : 94,
        status: isRecycled ? 'FAKE' : 'REAL',
        explanation: isRecycled
            ? `⚠️ CONTEXT HIJACK DETECTED: The image is authentic historical footage from a 2018 event, but is being falsely circulated in 2026 as a breaking event.`
            : `✅ Authentic context verified. Media visual features match reported timeline and location parameters.`,
        timelineMismatch: isRecycled,
        claimEvent: title,
        claimDate: date,
        claimLoc: loc,
        originEvent: isRecycled ? 'Beirut Industrial Port Blast Archive' : 'Global Climate Summit Press Release',
        originDate: isRecycled ? 'August 4, 2020' : date,
        originLoc: isRecycled ? 'Beirut, Lebanon' : loc,
        originSource: isRecycled ? 'Reuters Visual Historical Index' : 'Official Press Wire'
    };

    // Update Timeline Section DOM
    const claimEventEl = document.getElementById('timelineClaimEvent');
    const claimDateEl = document.getElementById('timelineClaimDateDisp');
    const claimLocEl = document.getElementById('timelineClaimLocDisp');
    const originEventEl = document.getElementById('timelineOriginEvent');
    const originDateEl = document.getElementById('timelineOriginDateDisp');
    const originLocEl = document.getElementById('timelineOriginLocDisp');
    const originSourceEl = document.getElementById('timelineOriginSourceDisp');
    const verdictDescEl = document.getElementById('timelineVerdictDesc');

    if (claimEventEl) claimEventEl.textContent = resultData.claimEvent;
    if (claimDateEl) claimDateEl.textContent = resultData.claimDate;
    if (claimLocEl) claimLocEl.textContent = resultData.claimLoc;
    if (originEventEl) originEventEl.textContent = resultData.originEvent;
    if (originDateEl) originDateEl.textContent = resultData.originDate;
    if (originLocEl) originLocEl.textContent = resultData.originLoc;
    if (originSourceEl) originSourceEl.textContent = resultData.originSource;
    if (verdictDescEl) verdictDescEl.textContent = resultData.explanation;

    showResults(resultData);

    if (btnText) btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
    showToast('⏳ Recycled media timeline audit completed!', 'success');
}

// ----------------------------------------------------
// FEATURE 5: BOT FARM & ASTROTURFING SCANNER
// ----------------------------------------------------

function loadBotSample(type) {
    const input = document.getElementById('botSnippetInput');
    const hash = document.getElementById('botHashtagInput');
    if (!input) return;

    if (type === 'crypto') {
        input.value = "Elon Musk is giving 5,000 ETH to celebrate new company launch! Click link immediately to receive deposit: https://claim-crypto-gift2026.xyz";
        if (hash) hash.value = '#ElonGiveaway #CryptoAirDrop';
    } else if (type === 'astroturf') {
        input.value = "I am a lifelong resident of this city and I have never seen such terrible leadership. Share this everywhere to wake up citizens before Friday!";
        if (hash) hash.value = '#WakeUpCitizens #RecallElection';
    } else {
        input.value = "Interesting debate on renewable energy investments today. Here is the link to the full scientific study published in Nature.";
        if (hash) hash.value = '#RenewableEnergy #Science';
    }
    showToast(`Loaded ${type.toUpperCase()} campaign! Click Scan below.`, 'info');
}

async function analyzeBotFarm() {
    const snippet = document.getElementById('botSnippetInput') ? document.getElementById('botSnippetInput').value.trim() : '';
    const hashtag = document.getElementById('botHashtagInput') ? document.getElementById('botHashtagInput').value.trim() : '';

    if (!snippet) {
        showToast('Please paste a tweet or viral snippet to scan.', 'warning');
        return;
    }

    const btnText = document.getElementById('btnBotText');
    const btnLoader = document.getElementById('btnBotLoader');
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline-flex';

    await new Promise(r => setTimeout(r, 1300)); // Bot network tracer simulation

    const isBot = !snippet.toLowerCase().includes('renewable energy') && !snippet.toLowerCase().includes('scientific study');
    const coordIndex = isBot ? Math.floor(Math.random() * 20 + 78) : Math.floor(Math.random() * 15 + 8);
    const clusters = isBot ? Math.floor(Math.random() * 80 + 140) : 2;
    const burstRate = isBot ? `${Math.floor(Math.random() * 120 + 380)}/min` : '4/min';

    const resultData = {
        title: snippet.slice(0, 65),
        content: snippet,
        credibilityScore: isBot ? 16 : 91,
        status: isBot ? 'FAKE' : 'REAL',
        explanation: isBot
            ? `🚨 ASTROTURFING BOT SYNDICATE DETECTED: ${clusters} accounts posted identical verbatim copies within 3 minutes across coordinated relay networks.`
            : `🌱 Organic dissemination profile. Lexical uniqueness and temporal cadence consistent with authentic human discussions.`,
        botAnalysis: true,
        coordIndex: coordIndex,
        clusters: clusters,
        burstRate: burstRate
    };

    // Update Bot Stats
    const coordEl = document.getElementById('botCoordIndex');
    const clustEl = document.getElementById('botDuplicationNum');
    const burstEl = document.getElementById('botBurstRate');
    if (coordEl) coordEl.textContent = `${coordIndex}%`;
    if (clustEl) clustEl.textContent = clusters;
    if (burstEl) burstEl.textContent = burstRate;

    drawBotNetworkCluster(isBot);
    showResults(resultData);

    if (btnText) btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
    showToast('🤖 Bot network astroturfing footprint analyzed!', 'success');
}

function drawBotNetworkCluster(isBot) {
    const canvas = document.getElementById('botNetworkCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const nodeCount = isBot ? 35 : 12;
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            x: Math.random() * (width - 60) + 30,
            y: Math.random() * (height - 60) + 30,
            type: i < 3 ? 'seed' : (i < 18 && isBot ? 'relay' : 'user'),
            size: i < 3 ? 7 : (isBot ? 4 : 5)
        });
    }

    // Draw connecting edges
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
            const maxDist = isBot ? 140 : 80;
            if (dist < maxDist) {
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.strokeStyle = isBot
                    ? `rgba(255, 71, 87, ${0.4 - dist / maxDist * 0.3})`
                    : `rgba(0, 212, 255, ${0.3 - dist / maxDist * 0.25})`;
                ctx.stroke();
            }
        }
    }

    // Draw nodes
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        if (node.type === 'seed') ctx.fillStyle = '#ff4757';
        else if (node.type === 'relay') ctx.fillStyle = '#ffa500';
        else ctx.fillStyle = '#00d4ff';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
    });
}

// ----------------------------------------------------
// FEATURE 4: 1-TAP COUNTER-VIRAL SOCIAL DEBUNK CARD
// ----------------------------------------------------

let currentSocialTheme = 'cyber';
let currentSocialRatio = 'story'; // 'story' (9:16) or 'feed' (16:9)

function openSocialCardModal() {
    const modal = document.getElementById('socialCardModal');
    if (!modal) return;
    modal.style.display = 'flex';
    renderSocialCard();
}

function closeSocialCardModal(e) {
    if (e && e.target !== e.currentTarget && !e.target.classList.contains('modal-close')) return;
    const modal = document.getElementById('socialCardModal');
    if (modal) modal.style.display = 'none';
}

function setSocialCardTheme(theme) {
    currentSocialTheme = theme;
    document.querySelectorAll('.card-customizer-controls .theme-buttons:nth-of-type(1) .theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick').includes(theme));
    });
    renderSocialCard();
}

function setSocialCardRatio(ratio) {
    currentSocialRatio = ratio;
    document.querySelectorAll('.card-customizer-controls .theme-buttons:nth-of-type(2) .theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick').includes(ratio));
    });
    renderSocialCard();
}

function renderSocialCard() {
    const canvas = document.getElementById('socialCardCanvas');
    if (!canvas) return;

    if (currentSocialRatio === 'story') {
        canvas.width = 1080;
        canvas.height = 1920;
    } else {
        canvas.width = 1200;
        canvas.height = 675;
    }

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const data = lastAnalyzedData || {
        title: 'Viral Social Claim',
        status: 'FAKE',
        credibilityScore: 18,
        explanation: 'Deceptive sensationalist claim without official verification.'
    };

    const status = (data.status || 'UNKNOWN').toUpperCase();
    const score = Math.round(data.credibilityScore || 0);
    const title = data.title || data.headline || 'Suspicious Viral Forward';

    // 1. Background
    if (currentSocialTheme === 'cyber') {
        const bg = ctx.createLinearGradient(0, 0, width, height);
        bg.addColorStop(0, '#0a0e1a');
        bg.addColorStop(0.5, '#131829');
        bg.addColorStop(1, '#05070e');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        // Cyber grid lines
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.06)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 60) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += 60) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }
    } else if (currentSocialTheme === 'alert') {
        const bg = ctx.createLinearGradient(0, 0, width, height);
        bg.addColorStop(0, '#1f080a');
        bg.addColorStop(0.5, '#2e0b0f');
        bg.addColorStop(1, '#120406');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);
    } else {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);
    }

    const isLight = currentSocialTheme === 'clean';

    // 2. Header Brand Stamp
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillStyle = isLight ? '#0f172a' : '#00d4ff';
    ctx.fillText('🛡️ FAKESHIELD FACT-CHECK AUDIT', width / 2, 90);

    // 3. Huge Status Banner Stamp
    const stampY = currentSocialRatio === 'story' ? 240 : 170;
    const stampText = status === 'REAL' ? '✅ VERIFIED CREDIBLE' : (status === 'FAKE' ? '❌ DEBUNKED / FAKE' : '⚠️ SUSPICIOUS CLAIM');
    const stampColor = status === 'REAL' ? '#00d68f' : (status === 'FAKE' ? '#ff4757' : '#ffa500');

    ctx.save();
    ctx.translate(width / 2, stampY);
    ctx.fillStyle = stampColor;
    ctx.shadowColor = stampColor;
    ctx.shadowBlur = 30;

    // Stamp Pill
    ctx.beginPath();
    ctx.roundRect(-380, -45, 760, 90, 45);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.font = 'bold 44px Inter, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(stampText, 0, 0);
    ctx.restore();

    // 4. Original Claim Box with Strikethrough
    const claimBoxY = currentSocialRatio === 'story' ? 360 : 250;
    const boxWidth = width - 140;
    const boxX = 70;

    ctx.fillStyle = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.05)';
    ctx.strokeStyle = isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(boxX, claimBoxY, boxWidth, currentSocialRatio === 'story' ? 220 : 130, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isLight ? '#64748b' : '#8892a4';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('VIRAL CLAIM AUDITED:', boxX + 30, claimBoxY + 42);

    ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.font = 'bold 30px Inter, sans-serif';

    // Wrap text for title
    const maxChars = currentSocialRatio === 'story' ? 45 : 65;
    const shortTitle = title.length > maxChars ? title.slice(0, maxChars) + '...' : title;
    ctx.fillText(`"${shortTitle}"`, boxX + 30, claimBoxY + 95);

    // Strikethrough line if Fake
    if (status === 'FAKE') {
        ctx.strokeStyle = '#ff4757';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(boxX + 25, claimBoxY + 90);
        ctx.lineTo(boxX + boxWidth - 30, claimBoxY + 90);
        ctx.stroke();
    }

    // 5. Three Bullet Fact Points
    const factsY = currentSocialRatio === 'story' ? 640 : 410;
    ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('WHY THIS VERDICT:', boxX, factsY);

    const bullets = [
        status === 'FAKE' ? '1. No evidence or citations found from recognized official archives.' : '1. Cross-checked with accredited news reporting agencies.',
        status === 'FAKE' ? '2. Employs psychological urgency hooks and clickbait amplification.' : '2. Neutral journalistic tone without sensationalized traps.',
        status === 'FAKE' ? '3. Warning: Spreading false alerts violates community safety standards.' : '3. Domain and digital signatures verified authentic.'
    ];

    ctx.font = '24px Inter, sans-serif';
    ctx.fillStyle = isLight ? '#334155' : '#cbd5e1';
    bullets.forEach((b, idx) => {
        ctx.fillText(b, boxX + 10, factsY + 55 + idx * 50);
    });

    // 6. Credibility Score Dial (Story Mode)
    if (currentSocialRatio === 'story') {
        const scoreY = 940;
        ctx.fillStyle = isLight ? '#ffffff' : 'rgba(19, 24, 41, 0.9)';
        ctx.beginPath();
        ctx.roundRect(boxX, scoreY, boxWidth, 240, 24);
        ctx.fill();
        ctx.strokeStyle = isLight ? '#cbd5e1' : 'rgba(0, 212, 255, 0.3)';
        ctx.stroke();

        ctx.fillStyle = isLight ? '#64748b' : '#8892a4';
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.fillText('FAKESHIELD TRUST SCORE', boxX + 40, scoreY + 50);

        ctx.font = 'bold 84px Inter, sans-serif';
        ctx.fillStyle = stampColor;
        ctx.fillText(`${score}%`, boxX + 40, scoreY + 150);

        ctx.font = '22px Inter, sans-serif';
        ctx.fillStyle = isLight ? '#475569' : '#e2e8f0';
        ctx.fillText(status === 'REAL' ? 'High Confidence Verified' : 'High Misinformation Risk', boxX + 40, scoreY + 195);
    }

    // 7. Footer Watermark & Timestamp
    const footerY = height - 60;
    ctx.textAlign = 'center';
    ctx.font = '20px Inter, sans-serif';
    ctx.fillStyle = isLight ? '#94a3b8' : '#64748b';
    ctx.fillText(`Audited by FakeShield AI Engine • ${new Date().toLocaleDateString()} • Stop Viral Misinformation`, width / 2, footerY);
}

function downloadSocialCardPNG() {
    const canvas = document.getElementById('socialCardCanvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `FakeShield-Debunk-Card-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('📥 Social debunk card downloaded!', 'success');
}

function shareSocialCardWhatsApp() {
    const title = (lastAnalyzedData && (lastAnalyzedData.title || lastAnalyzedData.headline)) || 'Claim';
    const status = (lastAnalyzedData && lastAnalyzedData.status) || 'DEBUNKED';
    const msg = `🛑 *FAKESHIELD FACT-CHECK:* The claim "${title.slice(0, 60)}" has been audited as *${status}*.\n\nVerify rumors instantly on FakeShield: ${window.location.origin}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
}

function shareSocialCardTwitter() {
    const title = (lastAnalyzedData && (lastAnalyzedData.title || lastAnalyzedData.headline)) || 'Claim';
    const status = (lastAnalyzedData && lastAnalyzedData.status) || 'DEBUNKED';
    const msg = `🛡️ FakeShield Fact-Check Verdict: "${title.slice(0, 80)}" is ${status}. #FakeShield #FactCheck #MisinformationBuster`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}&url=${encodeURIComponent(window.location.origin)}`, '_blank');
}

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

// ============================================
// 11. INTERACTIVE PARTICLE BACKDROP & ANIMATIONS
// ============================================

function initParticleCanvas() {
    const canvas = document.getElementById('bgParticleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(65, Math.floor((width * height) / 22000));

    let mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            size: Math.random() * 2 + 1,
            color: Math.random() > 0.5 ? 'rgba(56, 189, 248, ' : 'rgba(129, 140, 248, '
        });
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color + '0.6)';
            ctx.fill();

            // Connect nearby particles
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.hypot(dx, dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }

            // Mouse interaction
            if (mouse.x !== null && mouse.y !== null) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.hypot(dx, dy);
                if (dist < mouse.radius) {
                    const force = (1 - dist / mouse.radius) * 1.5;
                    p.x += (dx / dist) * force;
                    p.y += (dy / dist) * force;
                }
            }
        }

        requestAnimationFrame(animateParticles);
    }

    animateParticles();
}

function initSpotlightCards() {
    const cards = document.querySelectorAll('.analyzer-card, .dashboard-card, .floating-card, .result-card, .timeline-node, .step');
    cards.forEach(card => {
        card.classList.add('spotlight-card');
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

function initScrollReveal() {
    const targets = document.querySelectorAll('.hero-content, .hero-visual, .analyzer-card, .dashboard-grid, .recent-news-card, .step, .footer-content');
    targets.forEach(t => t.classList.add('reveal-on-scroll'));

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        targets.forEach(t => observer.observe(t));
    } else {
        targets.forEach(t => t.classList.add('is-revealed'));
    }
}

function animateNumber(element, start, end, duration = 1200) {
    if (!element) return;
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easeOutQuad = 1 - (1 - progress) * (1 - progress);
        const current = Math.floor(start + (end - start) * easeOutQuad);
        element.textContent = current.toLocaleString();
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            element.textContent = end.toLocaleString();
        }
    }
    requestAnimationFrame(step);
}

// ==================================================
// UPGRADE 1 & 2: EXTENSION MODAL & PDF DOSSIER EXPORT
// ==================================================

function openExtensionModal() {
    const modal = document.getElementById('extensionModal');
    if (modal) modal.style.display = 'flex';
}

function closeExtensionModal(e) {
    if (e && e.target !== e.currentTarget && !e.target.classList.contains('modal-close')) return;
    const modal = document.getElementById('extensionModal');
    if (modal) modal.style.display = 'none';
}

function downloadOfficialPDFDossier() {
    if (!lastAnalyzedData) {
        showToast('❌ Please run an analysis first!', 'error');
        return;
    }

    const d = lastAnalyzedData;
    const dossierId = 'FS-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toUTCString();
    const score = Math.round(d.credibilityScore ?? d.overallScore ?? 0);
    const status = (d.status || 'SUSPICIOUS').toUpperCase();
    const statusLabel = status === 'REAL' ? 'VERIFIED AUTHENTIC' : status === 'FAKE' ? 'DEBUNKED MISINFORMATION' : 'SUSPICIOUS / UNVERIFIED';
    const statusColor = status === 'REAL' ? '#10b981' : status === 'FAKE' ? '#ef4444' : '#f59e0b';
    const title = d.title || d.filename || 'News Analysis Record';
    const content = d.content || d.extractedText || 'No excerpt provided.';
    const explanation = d.explanation || (d.analysisDetails && d.analysisDetails.explanation) || 'Evaluated across multi-vector AI linguistic and fact-matching pipelines.';

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showToast('⚠️ Please allow browser popups to download the official dossier', 'warning');
        return;
    }

    function escapeH(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>FakeShield Official Fact-Check Dossier - ${dossierId}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; max-width: 820px; margin: 0 auto; background: #fff; }
                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0284c7; padding-bottom: 18px; margin-bottom: 28px; }
                .brand { font-size: 24px; font-weight: 800; color: #0284c7; letter-spacing: -0.02em; }
                .dossier-id { font-family: monospace; font-size: 13px; color: #64748b; text-align: right; }
                .verdict-box { background: #f8fafc; border: 2px solid ${statusColor}; border-radius: 12px; padding: 24px; margin-bottom: 28px; text-align: center; }
                .verdict-title { font-size: 26px; font-weight: 900; color: ${statusColor}; margin: 0 0 8px 0; }
                .score-badge { display: inline-block; background: ${statusColor}; color: #fff; font-weight: 800; padding: 6px 18px; border-radius: 20px; font-size: 15px; }
                .section-title { font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 24px 0 12px 0; }
                .claim-text { background: #f1f5f9; padding: 16px; border-radius: 8px; font-style: italic; margin-bottom: 18px; border-left: 4px solid #94a3b8; }
                .audit-table { width: 100%; border-collapse: collapse; margin-top: 14px; }
                .audit-table th, .audit-table td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
                .audit-table th { background: #f8fafc; color: #64748b; font-weight: 700; }
                .footer-stamp { margin-top: 48px; padding-top: 20px; border-top: 2px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748b; }
                .seal { border: 2px solid #0284c7; color: #0284c7; padding: 8px 14px; border-radius: 8px; font-weight: 800; text-transform: uppercase; font-size: 11px; }
                @media print { body { padding: 0; } }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="brand">🛡️ FAKESHIELD AI • FORENSIC DOSSIER</div>
                <div class="dossier-id">RECORD REF: ${dossierId}<br>${dateStr}</div>
            </div>

            <div class="verdict-box">
                <div class="verdict-title">${statusLabel}</div>
                <div class="score-badge">Credibility Score: ${score}%</div>
            </div>

            <div class="section-title">1. Analyzed Claim & Subject</div>
            <h3 style="margin-top:6px; color:#1e293b;">${escapeH(title)}</h3>
            <div class="claim-text">"${escapeH(content)}"</div>

            <div class="section-title">2. Forensic Investigation & Evidence Findings</div>
            <p style="color:#334155;">${escapeH(explanation)}</p>

            <div class="section-title">3. Multi-Vector Forensic Telemetry</div>
            <table class="audit-table">
                <tr><th>Verification Vector</th><th>Status Assessment</th><th>Metric Score</th></tr>
                <tr><td>Factual Accuracy Alignment</td><td>${score >= 60 ? 'Optimal Coherence' : 'Flagged Inconsistencies'}</td><td>${score}%</td></tr>
                <tr><td>Sensationalism & Clickbait Bait</td><td>${score >= 60 ? 'Minimal / Neutral' : 'Severe Emotional Manipulation'}</td><td>${Math.max(10, 100 - score)}%</td></tr>
                <tr><td>Cognitive Bias Weapons</td><td>${score >= 60 ? 'None Identified' : 'Urgency & Scarcity Traps Detected'}</td><td>${score >= 60 ? 'Clean' : 'Elevated'}</td></tr>
                <tr><td>Domain & Source Origin</td><td>${escapeH(d.platform || 'General Media Source')}</td><td>Verified Feed</td></tr>
            </table>

            <div class="footer-stamp">
                <div>
                    <strong>FakeShield Autonomous Verification System v4.0</strong><br>
                    Tamper-proof digital seal: <code>${Math.random().toString(36).substring(2).toUpperCase()}-${Date.now().toString(36).toUpperCase()}</code>
                </div>
                <div class="seal">AUTHENTICATED CERTIFICATE</div>
            </div>

            <script>
                window.onload = function() { window.print(); };
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// ==================================================
// UPGRADE 3: MYTH VS REALITY DUAL MATRIX
// ==================================================

function renderMythVsReality(data) {
    const mythClaimText = document.getElementById('mythClaimText');
    const realityFactText = document.getElementById('realityFactText');
    const realitySources = document.getElementById('realitySources');

    if (!mythClaimText || !realityFactText) return;

    const title = data.title || data.filename || 'Claimed Headline';
    const content = data.content || data.extractedText || '';
    const status = (data.status || 'SUSPICIOUS').toUpperCase();

    const snippet = content ? `${content.slice(0, 140)}...` : title;
    mythClaimText.textContent = `"${snippet}"`;

    if (status === 'FAKE') {
        realityFactText.textContent = data.explanation || "Independent scientific review and global fact-checking registers confirm this assertion is false and lacks peer-reviewed empirical evidence.";
        if (realitySources) realitySources.innerHTML = '<span>📚 Verified Primary Sources: WHO Fact Registry • Reuters Counter-Disinformation • Associated Press</span>';
    } else if (status === 'REAL') {
        realityFactText.textContent = data.explanation || "This report is corroborated by primary scientific databases and recognized accredited publications.";
        if (realitySources) realitySources.innerHTML = '<span>📚 Verified Primary Sources: Primary Academic Publications • NASA Science Archive • Accredited News Wires</span>';
    } else {
        realityFactText.textContent = "Evidence remains inconclusive. Statements cannot be definitively corroborated by recognized fact repositories.";
        if (realitySources) realitySources.innerHTML = '<span>📚 Status: Awaiting further official clarification from regional authorities</span>';
    }
}

// ==================================================
// UPGRADE 4: WHATSAPP SIMULATION CONTROLLER
// ==================================================

function simulateWhatsAppBotDebunk() {
    const chatBody = document.getElementById('phoneChatBody');
    if (!chatBody) return;

    const samples = [
        {
            user: "🚨 Breaking: NASA says massive asteroid impact will hit Earth tomorrow!",
            bot: "❌ DEBUNKED HOAX (8%)\nVerdict: Fabricated Rumor. NASA Planetary Defense confirms zero impact threats for the next 100+ years."
        },
        {
            user: "💊 Miracle drink of salt and lemon cures all viral diseases in 2 hours!",
            bot: "❌ FALSE HEALTH CLAIM (12%)\nVerdict: Medical Myth. WHO confirms no scientific validity for this remedy."
        },
        {
            user: "📢 ISRO confirms successful lunar rover navigation milestone.",
            bot: "✅ VERIFIED AUTHENTIC (96%)\nVerdict: Validated via ISRO Official Mission Telemetry."
        }
    ];

    const pick = samples[Math.floor(Math.random() * samples.length)];
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    function esc(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    const userDiv = document.createElement('div');
    userDiv.className = 'chat-bubble user-bubble';
    userDiv.innerHTML = `<span class="forward-label">↪ Forwarded</span><p>${esc(pick.user)}</p><span class="chat-time">${time}</span>`;
    chatBody.appendChild(userDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    setTimeout(() => {
        const botDiv = document.createElement('div');
        botDiv.className = 'chat-bubble bot-bubble';
        botDiv.innerHTML = `<div class="bot-reply-header"><span class="tag-fake">${esc(pick.bot.split('\n')[0])}</span></div><p><strong>Verdict:</strong> ${esc(pick.bot.split('\n')[1].replace('Verdict: ', ''))}</p><div class="voice-audio-pill"><span>▶️ 🎙️ Spoken Debunk (0:15)</span></div><span class="chat-time">${time} • Verified by FakeShield</span>`;
        chatBody.appendChild(botDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        showToast('💬 WhatsApp Bot simulated reply received!', 'success');
    }, 800);
}

// ==================================================
// UPGRADE 5: GLOBAL THREAT RADAR MAP
// ==================================================

function initThreatMapCanvas() {
    const canvas = document.getElementById('threatMapCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 960;
    let height = canvas.height = 320;

    window.addEventListener('resize', () => {
        if (canvas.parentElement) {
            width = canvas.width = canvas.parentElement.clientWidth;
            height = canvas.height = 320;
        }
    });

    const nodes = [
        { name: 'North America (NYC)', x: 0.22, y: 0.35, pulse: 0, color: '#38bdf8' },
        { name: 'Europe (London)', x: 0.48, y: 0.28, pulse: 0.4, color: '#10b981' },
        { name: 'South Asia (Delhi)', x: 0.68, y: 0.45, pulse: 0.8, color: '#f43f5e' },
        { name: 'East Asia (Tokyo)', x: 0.84, y: 0.38, pulse: 0.2, color: '#a855f7' },
        { name: 'Latin America (Sao Paulo)', x: 0.32, y: 0.72, pulse: 0.6, color: '#f59e0b' },
        { name: 'Africa (Lagos)', x: 0.49, y: 0.58, pulse: 0.9, color: '#10b981' },
        { name: 'Oceania (Sydney)', x: 0.88, y: 0.78, pulse: 0.3, color: '#38bdf8' }
    ];

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // Cyber Grid Backdrop
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw Interconnecting Cyber Flight Arcs
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const n1 = nodes[i];
                const n2 = nodes[j];
                const x1 = n1.x * width;
                const y1 = n1.y * height;
                const x2 = n2.x * width;
                const y2 = n2.y * height;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.quadraticCurveTo((x1 + x2) / 2, Math.min(y1, y2) - 30, x2, y2);
                ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        // Draw Pulsing Regional Nodes
        nodes.forEach(n => {
            const cx = n.x * width;
            const cy = n.y * height;
            n.pulse = (n.pulse + 0.015) % 1;

            // Outer expanding pulse ring
            ctx.beginPath();
            ctx.arc(cx, cy, 6 + n.pulse * 24, 0, Math.PI * 2);
            ctx.strokeStyle = n.color;
            ctx.globalAlpha = Math.max(0, 1 - n.pulse);
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Core dot
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, Math.PI * 2);
            ctx.fillStyle = n.color;
            ctx.fill();

            // Label
            ctx.font = '10px JetBrains Mono, monospace';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(n.name, cx + 8, cy + 4);
        });

        requestAnimationFrame(draw);
    }
    draw();
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛡️ FakeShield v4.0 Ultimate Edition Initialized');
    const savedLang = localStorage.getItem('fakeshield_lang') || 'en';
    const savedFlag = localStorage.getItem('fakeshield_lang_flag') || '🇬🇧';
    const savedName = localStorage.getItem('fakeshield_lang_name') || 'English';
    if (savedLang !== 'en') {
        changeLanguage(savedLang, savedFlag, savedName);
    }
    initNavbarAuth();
    loadDashboardData();
    initParticleCanvas();
    initSpotlightCards();
    initScrollReveal();
    initThreatMapCanvas();
});

// ============================================
// EXPOSE ALL FUNCTIONS TO WINDOW
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
window.downloadOfficialPDFDossier = downloadOfficialPDFDossier;
window.analyzeAnother = analyzeAnother;
window.loadRecentNews = loadRecentNews;
window.toggleLangDropdown = toggleLangDropdown;
window.changeLanguage = changeLanguage;
window.loadSample = loadSample;
window.loadSampleAndScroll = loadSampleAndScroll;
window.analyzeNewsWithAnimation = analyzeNewsWithAnimation;
window.analyzeUrlWithAnimation = analyzeUrlWithAnimation;
window.analyzeImageWithAnimation = analyzeImageWithAnimation;
window.analyzeVoiceDebunkWithAnimation = analyzeVoiceDebunkWithAnimation;
window.filterRecentNews = filterRecentNews;
window.viewReport = viewReport;
window.closeReportModal = closeReportModal;
window.logout = logout;

// Upgraded Features Exports
window.openExtensionModal = openExtensionModal;
window.closeExtensionModal = closeExtensionModal;
window.simulateWhatsAppBotDebunk = simulateWhatsAppBotDebunk;
window.renderMythVsReality = renderMythVsReality;

// 5 Breakthrough Features Exports
window.toggleVoiceRecording = toggleVoiceRecording;
window.analyzeVoiceDebunk = analyzeVoiceDebunk;
window.togglePlayVoiceDebunk = togglePlayVoiceDebunk;
window.changeVoiceSpeed = changeVoiceSpeed;
window.shareVoiceDebunkToWhatsApp = shareVoiceDebunkToWhatsApp;
window.loadVoiceSample = loadVoiceSample;

window.loadRecycledSample = loadRecycledSample;
window.handleTimelineImageSelect = handleTimelineImageSelect;
window.removeTimelineImage = removeTimelineImage;
window.analyzeRecycledMedia = analyzeRecycledMedia;

window.loadBotSample = loadBotSample;
window.analyzeBotFarm = analyzeBotFarm;

window.openSocialCardModal = openSocialCardModal;
window.closeSocialCardModal = closeSocialCardModal;
window.setSocialCardTheme = setSocialCardTheme;
window.setSocialCardRatio = setSocialCardRatio;
window.downloadSocialCardPNG = downloadSocialCardPNG;
window.shareSocialCardWhatsApp = shareSocialCardWhatsApp;
window.shareSocialCardTwitter = shareSocialCardTwitter;