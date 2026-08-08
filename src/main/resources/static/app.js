// ================================
// FakeShield Frontend Application
// With Text + Image Analysis
// ================================

const API_BASE_URL = '/api';
let selectedImage = null;

// ================================
// LANGUAGE SUPPORT
// ================================
let currentLanguage = localStorage.getItem('language') || 'en';
let currentLangEmoji = localStorage.getItem('langEmoji') || '🇬🇧';

// Translations dictionary
const translations = {
    en: {
        analyze: 'Analyze',
        dashboard: 'Dashboard',
        howItWorks: 'How It Works',
        about: 'About',
        analyzeNews: 'Analyze News',
        textAnalysis: '📝 Text Analysis',
        imageAnalysis: '🖼️ Image Analysis',
        headline: 'News Headline',
        content: 'News Content',
        analyzeButton: '🤖 Analyze Text',
        uploadTitle: 'Drop Image Here or Click to Upload',
        analyzing: 'Analyzing...',
        realNews: 'Real News',
        fakeNews: 'Fake News',
        suspicious: 'Suspicious'
    },
    ta: {
        analyze: 'பகுப்பாய்வு',
        dashboard: 'டாஷ்போர்டு',
        howItWorks: 'எப்படி வேலை செய்கிறது',
        about: 'பற்றி',
        analyzeNews: 'செய்தி பகுப்பாய்வு',
        textAnalysis: '📝 உரை பகுப்பாய்வு',
        imageAnalysis: '🖼️ படம் பகுப்பாய்வு',
        headline: 'செய்தி தலைப்பு',
        content: 'செய்தி உள்ளடக்கம்',
        analyzeButton: '🤖 உரையை பகுப்பாய்வு செய்',
        uploadTitle: 'படத்தை இங்கே விடுங்கள்',
        analyzing: 'பகுப்பாய்வு...',
        realNews: 'உண்மையான செய்தி',
        fakeNews: 'போலி செய்தி',
        suspicious: 'சந்தேகத்திற்குரிய'
    },
    hi: {
        analyze: 'विश्लेषण',
        dashboard: 'डैशबोर्ड',
        howItWorks: 'यह कैसे काम करता है',
        about: 'बारे में',
        analyzeNews: 'समाचार विश्लेषण',
        textAnalysis: '📝 पाठ विश्लेषण',
        imageAnalysis: '🖼️ छवि विश्लेषण',
        headline: 'समाचार शीर्षक',
        content: 'समाचार सामग्री',
        analyzeButton: '🤖 पाठ का विश्लेषण करें',
        uploadTitle: 'छवि यहाँ छोड़ें',
        analyzing: 'विश्लेषण कर रहा है...',
        realNews: 'असली समाचार',
        fakeNews: 'फर्जी खबर',
        suspicious: 'संदिग्ध'
    },
    es: {
        analyze: 'Analizar',
        dashboard: 'Panel',
        howItWorks: 'Cómo funciona',
        about: 'Acerca de',
        analyzeNews: 'Analizar Noticias',
        textAnalysis: '📝 Análisis de Texto',
        imageAnalysis: '🖼️ Análisis de Imagen',
        headline: 'Titular',
        content: 'Contenido',
        analyzeButton: '🤖 Analizar Texto',
        uploadTitle: 'Suelta la imagen aquí',
        analyzing: 'Analizando...',
        realNews: 'Noticias Reales',
        fakeNews: 'Noticias Falsas',
        suspicious: 'Sospechoso'
    },
    fr: {
        analyze: 'Analyser',
        dashboard: 'Tableau de bord',
        howItWorks: 'Comment ça marche',
        about: 'À propos',
        analyzeNews: 'Analyser les nouvelles',
        textAnalysis: '📝 Analyse de texte',
        imageAnalysis: '🖼️ Analyse d\'image',
        headline: 'Titre',
        content: 'Contenu',
        analyzeButton: '🤖 Analyser le texte',
        uploadTitle: 'Déposez l\'image ici',
        analyzing: 'Analyse en cours...',
        realNews: 'Vraies nouvelles',
        fakeNews: 'Fausses nouvelles',
        suspicious: 'Suspect'
    },
    de: {
        analyze: 'Analysieren',
        dashboard: 'Dashboard',
        howItWorks: 'Wie es funktioniert',
        about: 'Über',
        analyzeNews: 'Nachrichten analysieren',
        textAnalysis: '📝 Textanalyse',
        imageAnalysis: '🖼️ Bildanalyse',
        headline: 'Schlagzeile',
        content: 'Inhalt',
        analyzeButton: '🤖 Text analysieren',
        uploadTitle: 'Bild hier ablegen',
        analyzing: 'Analysiere...',
        realNews: 'Echte Nachrichten',
        fakeNews: 'Falsche Nachrichten',
        suspicious: 'Verdächtig'
    }
};

function toggleLangDropdown() {
    const dropdown = document.getElementById('langDropdown');
    const btn = document.querySelector('.lang-btn');
    dropdown.classList.toggle('show');
    btn.classList.toggle('active');
}

function changeLanguage(code, emoji, name) {
    currentLanguage = code;
    currentLangEmoji = emoji;

    localStorage.setItem('language', code);
    localStorage.setItem('langEmoji', emoji);

    document.getElementById('currentLang').textContent = `${emoji} ${code.toUpperCase()}`;

    // Close dropdown
    document.getElementById('langDropdown').classList.remove('show');
    document.querySelector('.lang-btn').classList.remove('active');

    // Apply translations
    applyTranslations();

    // Show notification
    showToast(`✅ Language changed to ${name}`, 'success');
}

function applyTranslations() {
    const t = translations[currentLanguage] || translations.en;

    // Update nav links
    const navLinks = document.querySelectorAll('.nav-links a');
    if (navLinks[0]) navLinks[0].textContent = t.analyze;
    if (navLinks[1]) navLinks[1].textContent = t.dashboard;
    if (navLinks[2]) navLinks[2].textContent = t.howItWorks;
    if (navLinks[3]) navLinks[3].textContent = t.about;

    // Update tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (tabBtns[0]) tabBtns[0].textContent = t.textAnalysis;
    if (tabBtns[1]) tabBtns[1].textContent = t.imageAnalysis;

    // Update analyze button
    const btnText = document.getElementById('btnText');
    if (btnText) btnText.textContent = t.analyzeButton;

    // Update upload title
    const uploadTitle = document.querySelector('.upload-area h3');
    if (uploadTitle) uploadTitle.textContent = t.uploadTitle;

    // Update section header
    const analyzerHeader = document.querySelector('#analyzer .section-header h2');
    if (analyzerHeader) analyzerHeader.textContent = t.analyzeNews;

    // Update form labels
    const labels = document.querySelectorAll('#tab-text .form-group label');
    if (labels[0]) labels[0].innerHTML = t.headline + ' <span class="required">*</span>';
    if (labels[1]) labels[1].textContent = t.content;
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentLang').textContent = `${currentLangEmoji} ${currentLanguage.toUpperCase()}`;
    applyTranslations();
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.language-switcher')) {
        const dropdown = document.getElementById('langDropdown');
        const btn = document.querySelector('.lang-btn');
        if (dropdown) dropdown.classList.remove('show');
        if (btn) btn.classList.remove('active');
    }
});
// ================================
// Initialize on Page Load
// ================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛡️ FakeShield Loaded');
    loadStatistics();
    loadRecentNews();
    animateHeroStats();
    setupDragAndDrop();

    setInterval(() => {
        loadStatistics();
        loadRecentNews();
    }, 30000);
});

// ================================
// Tab Switching
// ================================
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Hide result card when switching tabs
    document.getElementById('resultCard').style.display = 'none';
}

// ================================
// Smooth Scroll
// ================================
function scrollToAnalyzer() {
    document.getElementById('analyzer').scrollIntoView({ behavior: 'smooth' });
}

function scrollToDashboard() {
    document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
}

// ================================
// IMAGE UPLOAD - Drag & Drop
// ================================
function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    if (!uploadArea) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('dragover');
        });
    });

    uploadArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    });
}

// ================================
// Handle Image Selection
// ================================
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleImageFile(file);
    }
}

function handleImageFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('⚠️ Please select an image file', 'error');
        return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showToast('⚠️ File size must be less than 10MB', 'error');
        return;
    }

    selectedImage = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('previewImage').src = e.target.result;
        document.getElementById('previewName').textContent = file.name;
        document.getElementById('previewSize').textContent =
            `Size: ${(file.size / 1024).toFixed(2)} KB | Type: ${file.type}`;

        document.getElementById('uploadContent').style.display = 'none';
        document.getElementById('previewContent').style.display = 'block';
        document.getElementById('btnAnalyzeImage').disabled = false;
    };
    reader.readAsDataURL(file);

    showToast('✅ Image loaded successfully', 'success');
}

// ================================
// Remove Selected Image
// ================================
function removeImage(event) {
    event.stopPropagation();
    selectedImage = null;
    document.getElementById('imageInput').value = '';
    document.getElementById('uploadContent').style.display = 'block';
    document.getElementById('previewContent').style.display = 'none';
    document.getElementById('btnAnalyzeImage').disabled = true;
    document.getElementById('resultCard').style.display = 'none';
}

// ================================
// Analyze Image
// ================================
async function analyzeImage() {
    if (!selectedImage) {
        showToast('⚠️ Please select an image first', 'error');
        return;
    }

    // Show loading
    document.getElementById('btnImageText').style.display = 'none';
    document.getElementById('btnImageLoader').style.display = 'flex';
    document.getElementById('btnAnalyzeImage').disabled = true;
    document.getElementById('resultCard').style.display = 'none';

    try {
        const formData = new FormData();
        formData.append('file', selectedImage);

        console.log('📤 Uploading image for analysis...');

        const response = await fetch(`${API_BASE_URL}/images/analyze`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Image analysis result:', data);

        displayImageResults(data);
        showToast('✅ Image analysis complete!', 'success');

    } catch (error) {
        console.error('❌ Image analysis error:', error);
        showToast('❌ ' + error.message, 'error');
    } finally {
        document.getElementById('btnImageText').style.display = 'flex';
        document.getElementById('btnImageLoader').style.display = 'none';
        document.getElementById('btnAnalyzeImage').disabled = false;
    }
}

// ================================
// Display Image Results
// ================================
function displayImageResults(data) {
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
    animateScore(score, statusInfo.color);

    // Show extracted text
    const extractedSection = document.getElementById('extractedTextSection');
    const extractedBox = document.getElementById('extractedTextBox');

    if (data.extractedText && data.extractedText.trim().length > 0) {
        extractedSection.style.display = 'block';
        extractedBox.textContent = data.extractedText;
    } else {
        extractedSection.style.display = 'block';
        extractedBox.textContent = 'No text detected in image';
    }

    // Display image-specific breakdown
    displayImageBreakdown(data);

    document.getElementById('explanationText').textContent =
        data.explanation || 'Analysis complete.';

    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ================================
// Display Image Breakdown
// ================================
function displayImageBreakdown(data) {
    const breakdownGrid = document.getElementById('breakdownGrid');

    const metrics = [
        { label: 'Visual Analysis', value: data.visualScore || 0, icon: '👁️' },
        { label: 'Metadata Check', value: data.metadataScore || 0, icon: '📋' },
        { label: 'OCR Quality', value: data.ocrScore || 0, icon: '🔍' },
        { label: 'Text Content', value: data.textScore || 0, icon: '📝' }
    ];

    breakdownGrid.innerHTML = metrics.map(metric => {
        const value = Math.round(metric.value);
        const color = getScoreColor(value);
        return `
            <div class="breakdown-item">
                <div class="breakdown-header">
                    <span class="breakdown-icon">${metric.icon}</span>
                    <span class="breakdown-label">${metric.label}</span>
                </div>
                <div class="breakdown-value" style="color: ${color}">
                    ${value}%
                </div>
                <div class="breakdown-bar">
                    <div class="breakdown-bar-fill" 
                         style="background: ${color}"
                         data-width="${value}%">
                    </div>
                </div>
            </div>
        `;
    }).join('');

    setTimeout(() => {
        document.querySelectorAll('.breakdown-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.width;
        });
    }, 100);
}

// ================================
// TEXT ANALYSIS (Existing)
// ================================
async function analyzeNews() {
    const title = document.getElementById('newsTitle').value.trim();
    const content = document.getElementById('newsContent').value.trim();
    const sourceUrl = document.getElementById('sourceUrl').value.trim();
    const platform = document.getElementById('platform').value;

    if (!title) {
        showToast('⚠️ Please enter a news headline', 'error');
        document.getElementById('newsTitle').focus();
        return;
    }

    setLoadingState(true);
    document.getElementById('resultCard').style.display = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/news/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, sourceUrl, platform })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data);
        showToast('✅ Analysis complete!', 'success');

        setTimeout(() => {
            loadStatistics();
            loadRecentNews();
        }, 1000);

    } catch (error) {
        console.error('❌ Analysis error:', error);
        showToast('❌ Analysis failed. Is backend running?', 'error');
    } finally {
        setLoadingState(false);
    }
}

function setLoadingState(loading) {
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    const btn = document.getElementById('btnAnalyze');

    if (loading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        btn.disabled = true;
    } else {
        btnText.style.display = 'flex';
        btnLoader.style.display = 'none';
        btn.disabled = false;
    }
}

function displayResults(data) {
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
    animateScore(score, statusInfo.color);

    // Hide extracted text section for text analysis
    document.getElementById('extractedTextSection').style.display = 'none';

    if (data.analysisDetails) {
        displayBreakdown(data.analysisDetails);
        const explanationText = data.analysisDetails.explanation || 'Analysis complete.';
        document.getElementById('explanationText').textContent = explanationText;
    }

    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displayBreakdown(details) {
    const breakdownGrid = document.getElementById('breakdownGrid');

    const metrics = [
        { label: 'ML Analysis', value: details.mlScore || 0, icon: '🤖' },
        { label: 'NLP Analysis', value: details.nlpScore || 0, icon: '📝' },
        { label: 'Source Check', value: details.sourceScore || 0, icon: '🔗' },
        { label: 'Clickbait', value: details.clickbaitScore || 0, icon: '🎯' },
        { label: 'Grammar', value: details.grammarScore || 0, icon: '✍️' },
        { label: 'Fact Check', value: details.factCheckScore || 0, icon: '✔️' }
    ];

    breakdownGrid.innerHTML = metrics.map(metric => {
        const value = Math.round(metric.value);
        const color = getScoreColor(value);
        return `
            <div class="breakdown-item">
                <div class="breakdown-header">
                    <span class="breakdown-icon">${metric.icon}</span>
                    <span class="breakdown-label">${metric.label}</span>
                </div>
                <div class="breakdown-value" style="color: ${color}">
                    ${value}%
                </div>
                <div class="breakdown-bar">
                    <div class="breakdown-bar-fill" 
                         style="background: ${color}"
                         data-width="${value}%">
                    </div>
                </div>
            </div>
        `;
    }).join('');

    setTimeout(() => {
        document.querySelectorAll('.breakdown-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.width;
        });
    }, 100);
}

// ================================
// Animate Score
// ================================
function animateScore(targetScore, color) {
    const scoreValue = document.getElementById('scoreValue');
    const circle = document.getElementById('scoreCircle');
    const circumference = 377;

    circle.style.color = color;

    let currentScore = 0;
    const increment = Math.max(1, Math.ceil(targetScore / 40));

    const interval = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(interval);
        }
        scoreValue.textContent = currentScore;
        const offset = circumference - (currentScore / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }, 25);
}

function getScoreColor(score) {
    if (score >= 75) return '#00D68F';
    if (score >= 50) return '#FFA500';
    if (score >= 25) return '#FF9F43';
    return '#FF4757';
}

// ================================
// Load Statistics
// ================================
async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE_URL}/news/statistics`);
        if (!response.ok) throw new Error('Failed to load statistics');

        const stats = await response.json();

        animateNumber('heroTotal', stats.total || 0);
        animateNumber('heroFake', stats.fake || 0);
        animateNumber('dashTotal', stats.total || 0);
        animateNumber('dashFake', stats.fake || 0);
        animateNumber('dashReal', stats.real || 0);
        animateNumber('dashSuspicious', stats.suspicious || 0);

    } catch (error) {
        console.error('❌ Failed to load statistics:', error);
    }
}

async function loadRecentNews() {
    const tbody = document.getElementById('newsTableBody');

    try {
        const response = await fetch(`${API_BASE_URL}/news/all`);
        if (!response.ok) throw new Error('Failed to load news');

        const newsList = await response.json();

        if (!newsList || newsList.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        No news analyzed yet. Try analyzing one above!
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = newsList.slice(0, 10).map(news => {
            const score = Math.round(news.credibilityScore);
            const scoreColor = getScoreColor(score);
            const statusClass = news.status.toLowerCase();

            return `
                <tr>
                    <td style="max-width:400px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">
                        ${escapeHtml(news.title)}
                    </td>
                    <td>${news.platform || 'Unknown'}</td>
                    <td style="color: ${scoreColor}; font-weight: 700">
                        ${score}%
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${news.statusDisplay}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('❌ Failed to load news:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    ⚠️ Cannot connect to backend.
                </td>
            </tr>
        `;
    }
}

function animateNumber(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const current = parseInt(element.textContent) || 0;
    const increment = Math.max(1, Math.ceil((target - current) / 20));

    if (current === target) return;

    let value = current;
    const interval = setInterval(() => {
        if (target > current) {
            value += increment;
            if (value >= target) {
                value = target;
                clearInterval(interval);
            }
        } else {
            value -= increment;
            if (value <= target) {
                value = target;
                clearInterval(interval);
            }
        }
        element.textContent = value.toLocaleString();
    }, 30);
}

function animateHeroStats() {
    setTimeout(() => loadStatistics(), 500);
}

// ================================
// Actions
// ================================
function shareResult() {
    const status = document.getElementById('statusText').textContent;
    const score = document.getElementById('scoreValue').textContent;

    const text = `🛡️ FakeShield Analysis:\n📊 Score: ${score}%\n⚠️ Status: ${status}\n\n🔗 ${window.location.origin}`;

    if (navigator.share) {
        navigator.share({ title: 'FakeShield Result', text: text });
    } else {
        navigator.clipboard.writeText(text)
            .then(() => showToast('✅ Copied to clipboard!', 'success'))
            .catch(() => showToast('❌ Failed to copy', 'error'));
    }
}

function copyResult() {
    const status = document.getElementById('statusText').textContent;
    const score = document.getElementById('scoreValue').textContent;
    const explanation = document.getElementById('explanationText').textContent;

    const report = `FAKESHIELD ANALYSIS REPORT\n\nScore: ${score}%\nStatus: ${status}\n\nDetails:\n${explanation}\n\nGenerated: ${new Date().toLocaleString()}`;

    navigator.clipboard.writeText(report)
        .then(() => showToast('📋 Report copied!', 'success'))
        .catch(() => showToast('❌ Failed to copy', 'error'));
}

function analyzeAnother() {
    document.getElementById('resultCard').style.display = 'none';
    document.getElementById('newsTitle').value = '';
    document.getElementById('newsContent').value = '';
    document.getElementById('sourceUrl').value = '';
    document.getElementById('platform').value = '';
    removeImage(new Event('click'));
    document.getElementById('analyzer').scrollIntoView({ behavior: 'smooth' });
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => toast.classList.remove('show'), 3500);
}

function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}