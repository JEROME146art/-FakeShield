// ================================
// FakeShield Frontend Application
// Connects to Spring Boot Backend
// ================================

const API_BASE_URL = '/api';

// ================================
// Initialize on Page Load
// ================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛡️ FakeShield Loaded');
    loadStatistics();
    loadRecentNews();
    animateHeroStats();

    // Auto-refresh dashboard every 30 seconds
    setInterval(() => {
        loadStatistics();
        loadRecentNews();
    }, 30000);
});

// ================================
// Smooth Scroll Functions
// ================================
function scrollToAnalyzer() {
    document.getElementById('analyzer').scrollIntoView({
        behavior: 'smooth'
    });
}

function scrollToDashboard() {
    document.getElementById('dashboard').scrollIntoView({
        behavior: 'smooth'
    });
}

// ================================
// MAIN: Analyze News
// ================================
async function analyzeNews() {
    const title = document.getElementById('newsTitle').value.trim();
    const content = document.getElementById('newsContent').value.trim();
    const sourceUrl = document.getElementById('sourceUrl').value.trim();
    const platform = document.getElementById('platform').value;

    // Validation
    if (!title) {
        showToast('⚠️ Please enter a news headline', 'error');
        document.getElementById('newsTitle').focus();
        return;
    }

    // Show loading state
    setLoadingState(true);

    // Hide previous result
    document.getElementById('resultCard').style.display = 'none';

    try {
        console.log('📡 Sending request to backend...');

        const response = await fetch(`${API_BASE_URL}/news/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                content: content,
                sourceUrl: sourceUrl,
                platform: platform
            })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Response received:', data);

        displayResults(data);
        showToast('✅ Analysis complete!', 'success');

        // Refresh dashboard
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

// ================================
// Set Loading State
// ================================
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

// ================================
// Display Results
// ================================
function displayResults(data) {
    const resultCard = document.getElementById('resultCard');

    // Status configuration
    const statusMap = {
        'REAL': { icon: '✅', color: '#00D68F' },
        'FAKE': { icon: '❌', color: '#FF4757' },
        'SUSPICIOUS': { icon: '⚠️', color: '#FFA500' },
        'UNVERIFIED': { icon: '❓', color: '#6c757d' }
    };

    const statusInfo = statusMap[data.status] || statusMap['UNVERIFIED'];

    // Update status
    document.getElementById('statusIcon').textContent = statusInfo.icon;
    document.getElementById('statusText').textContent = data.statusDisplay;
    document.getElementById('statusText').style.color = statusInfo.color;

    // Animate score
    const score = Math.round(data.credibilityScore);
    animateScore(score, statusInfo.color);

    // Display breakdown
    if (data.analysisDetails) {
        displayBreakdown(data.analysisDetails);

        // Display explanation
        const explanationText = data.analysisDetails.explanation ||
            'Analysis complete. See breakdown above for details.';
        document.getElementById('explanationText').textContent = explanationText;
    }

    // Show result card
    resultCard.style.display = 'block';
    resultCard.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// ================================
// Display Score Breakdown
// ================================
function displayBreakdown(details) {
    const breakdownGrid = document.getElementById('breakdownGrid');

    const metrics = [
        {
            label: 'ML Analysis',
            value: details.mlScore || 0,
            icon: '🤖'
        },
        {
            label: 'NLP Analysis',
            value: details.nlpScore || 0,
            icon: '📝'
        },
        {
            label: 'Source Check',
            value: details.sourceScore || 0,
            icon: '🔗'
        },
        {
            label: 'Clickbait',
            value: details.clickbaitScore || 0,
            icon: '🎯'
        },
        {
            label: 'Grammar',
            value: details.grammarScore || 0,
            icon: '✍️'
        },
        {
            label: 'Fact Check',
            value: details.factCheckScore || 0,
            icon: '✔️'
        }
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

    // Animate bars after render
    setTimeout(() => {
        document.querySelectorAll('.breakdown-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.width;
        });
    }, 100);
}

// ================================
// Animate Score Circle
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

// ================================
// Get Score Color
// ================================
function getScoreColor(score) {
    if (score >= 75) return '#00D68F'; // Green
    if (score >= 50) return '#FFA500'; // Orange
    if (score >= 25) return '#FF9F43'; // Yellow-orange
    return '#FF4757';                   // Red
}

// ================================
// Load Statistics
// ================================
async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE_URL}/news/statistics`);

        if (!response.ok) {
            throw new Error('Failed to load statistics');
        }

        const stats = await response.json();
        console.log('📊 Statistics:', stats);

        // Update hero stats
        animateNumber('heroTotal', stats.total || 0);
        animateNumber('heroFake', stats.fake || 0);

        // Update dashboard
        animateNumber('dashTotal', stats.total || 0);
        animateNumber('dashFake', stats.fake || 0);
        animateNumber('dashReal', stats.real || 0);
        animateNumber('dashSuspicious', stats.suspicious || 0);

    } catch (error) {
        console.error('❌ Failed to load statistics:', error);
    }
}

// ================================
// Load Recent News
// ================================
async function loadRecentNews() {
    const tbody = document.getElementById('newsTableBody');

    try {
        const response = await fetch(`${API_BASE_URL}/news/all`);

        if (!response.ok) {
            throw new Error('Failed to load news');
        }

        const newsList = await response.json();
        console.log('📰 News loaded:', newsList.length);

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
                    ⚠️ Cannot connect to backend. Make sure Spring Boot is running.
                </td>
            </tr>
        `;
    }
}

// ================================
// Animate Number Counter
// ================================
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

// ================================
// Animate Hero Stats
// ================================
function animateHeroStats() {
    setTimeout(() => {
        loadStatistics();
    }, 500);
}

// ================================
// Share Result
// ================================
function shareResult() {
    const status = document.getElementById('statusText').textContent;
    const score = document.getElementById('scoreValue').textContent;
    const title = document.getElementById('newsTitle').value;

    const text = `🛡️ FakeShield Analysis:\n\n` +
        `📰 "${title}"\n\n` +
        `📊 Credibility Score: ${score}%\n` +
        `⚠️ Status: ${status}\n\n` +
        `🔗 Check your news at: ${window.location.origin}`;

    if (navigator.share) {
        navigator.share({
            title: 'FakeShield Analysis Result',
            text: text
        }).catch(err => console.log('Share cancelled'));
    } else {
        navigator.clipboard.writeText(text)
            .then(() => showToast('✅ Copied to clipboard!', 'success'))
            .catch(() => showToast('❌ Failed to copy', 'error'));
    }
}

// ================================
// Copy Result
// ================================
function copyResult() {
    const status = document.getElementById('statusText').textContent;
    const score = document.getElementById('scoreValue').textContent;
    const title = document.getElementById('newsTitle').value;
    const explanation = document.getElementById('explanationText').textContent;

    const report = `╔═══════════════════════════════════╗\n` +
        `      FAKESHIELD ANALYSIS REPORT      \n` +
        `╚═══════════════════════════════════╝\n\n` +
        `Title: ${title}\n\n` +
        `Credibility Score: ${score}%\n` +
        `Status: ${status}\n\n` +
        `Analysis Details:\n${explanation}\n\n` +
        `Generated by FakeShield\n` +
        `${new Date().toLocaleString()}`;

    navigator.clipboard.writeText(report)
        .then(() => showToast('📋 Report copied to clipboard!', 'success'))
        .catch(() => showToast('❌ Failed to copy report', 'error'));
}

// ================================
// Analyze Another
// ================================
function analyzeAnother() {
    document.getElementById('resultCard').style.display = 'none';
    document.getElementById('newsTitle').value = '';
    document.getElementById('newsContent').value = '';
    document.getElementById('sourceUrl').value = '';
    document.getElementById('platform').value = '';
    document.getElementById('newsTitle').focus();

    document.getElementById('analyzer').scrollIntoView({
        behavior: 'smooth'
    });
}

// ================================
// Toast Notification
// ================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// ================================
// Escape HTML (Security)
// ================================
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ================================
// Handle Enter Key in Title
// ================================
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'newsTitle') {
        e.preventDefault();
        document.getElementById('newsContent').focus();
    }
});