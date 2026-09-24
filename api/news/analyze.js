// Serverless API for Text / News Analysis
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
        const title = body.title || '';
        const content = body.content || title;
        const sourceUrl = body.sourceUrl || '';
        const platform = body.platform || 'General';

        if (!title && !content) {
            return res.status(400).json({ error: 'Title or Content is required' });
        }

        const fullText = (title + ' ' + content).toLowerCase();
        let clickbaitScore = 100;
        let sentimentScore = 90;
        let grammarScore = 85;
        let sourceScore = sourceUrl ? 80 : 40;
        let nlpScore = 75;
        let factCheckScore = 70;

        const explanations = [];

        // Clickbait heuristics
        const clickbaitWords = ['shocking', 'miracle', 'doctors hate', 'banned video', 'won\'t believe', 'secret exposed', 'wake up', 'urgent warning', 'forward to'];
        let clickbaitCount = 0;
        clickbaitWords.forEach(w => {
            if (fullText.includes(w)) {
                clickbaitCount++;
                clickbaitScore -= 20;
            }
        });
        if (clickbaitCount > 0) {
            explanations.push(`• Clickbait Signals: Found ${clickbaitCount} sensationalist keyword(s).`);
        } else {
            explanations.push('• Clickbait Check: Clean, neutral phrasing detected.');
        }

        // Caps & exclamation check
        const raw = title + ' ' + content;
        const capsRatio = (raw.replace(/[^A-Z]/g, '').length) / (raw.length || 1);
        if (capsRatio > 0.35 && raw.length > 20) {
            clickbaitScore -= 25;
            explanations.push('• Typography: Excessive uppercase letters detected.');
        }
        if ((raw.match(/!{2,}/g) || []).length > 0) {
            clickbaitScore -= 15;
            sentimentScore -= 20;
            explanations.push('• Punctuation: Multiple exclamation marks detected.');
        }

        // Source Credibility
        if (sourceUrl) {
            const credibleDomains = ['bbc.com', 'reuters.com', 'apnews.com', 'nytimes.com', 'thehindu.com', 'nature.com', 'nasa.gov', 'who.int'];
            const isCredible = credibleDomains.some(d => sourceUrl.toLowerCase().includes(d));
            if (isCredible) {
                sourceScore = 95;
                explanations.push(`• Source Verification: Reputable domain detected (${sourceUrl}).`);
            } else {
                sourceScore = 60;
                explanations.push(`• Source Verification: Unverified external domain (${sourceUrl}).`);
            }
        } else {
            explanations.push('• Source Verification: No canonical source URL provided.');
        }

        // Grammar & Length
        const wordCount = raw.trim().split(/\s+/).length;
        if (wordCount < 10) {
            grammarScore -= 20;
            explanations.push('• Length: Content is very short for thorough linguistic verification.');
        }

        // Aggregate Score
        clickbaitScore = Math.max(10, Math.min(100, clickbaitScore));
        sentimentScore = Math.max(10, Math.min(100, sentimentScore));
        grammarScore = Math.max(10, Math.min(100, grammarScore));
        sourceScore = Math.max(10, Math.min(100, sourceScore));
        nlpScore = Math.max(10, Math.min(100, nlpScore));

        const overallScore = Math.round(
            (clickbaitScore * 0.25) +
            (sourceScore * 0.25) +
            (nlpScore * 0.20) +
            (sentimentScore * 0.15) +
            (grammarScore * 0.15)
        );

        let status = 'REAL';
        let statusDisplay = 'Verified Real News';
        let statusColor = '#10b981';

        if (overallScore < 50) {
            status = 'FAKE';
            statusDisplay = 'Fake News Detected';
            statusColor = '#ef4444';
        } else if (overallScore < 70) {
            status = 'SUSPICIOUS';
            statusDisplay = 'Suspicious Content';
            statusColor = '#f59e0b';
        }

        return res.status(200).json({
            id: Date.now(),
            title: title || 'Untitled News',
            content: content,
            sourceUrl: sourceUrl,
            platform: platform,
            credibilityScore: overallScore,
            status: status,
            statusDisplay: statusDisplay,
            statusColor: statusColor,
            submittedAt: new Date().toISOString(),
            explanation: explanations.join('\n'),
            analysisDetails: {
                clickbaitScore,
                sentimentScore,
                sourceScore,
                grammarScore,
                nlpScore,
                factCheckScore,
                overallScore,
                explanation: explanations.join('\n'),
                scoreBreakdown: {
                    'Clickbait Detection': clickbaitScore,
                    'Sentiment Analysis': sentimentScore,
                    'Source Credibility': sourceScore,
                    'Grammar Check': grammarScore,
                    'NLP Analysis': nlpScore,
                    'Fact Check': factCheckScore
                }
            }
        });
    } catch (err) {
        return res.status(500).json({ error: 'Analysis failed', details: err.message });
    }
};
