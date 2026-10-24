// Serverless API for URL Analysis
module.exports = async (req, res) => {
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
        let url = body.url || '';

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        let parsedDomain = 'Unknown';
        try {
            parsedDomain = new URL(url).hostname.replace('www.', '');
        } catch (e) {}

        let fetchedTitle = `Article from ${parsedDomain}`;
        let fetchedContent = `Content extracted from ${url}`;
        const explanations = [];
        let fetchSuccess = false;

        // Try fetching page metadata
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);

            const pageRes = await fetch(url, {
                signal: controller.signal,
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            clearTimeout(timeout);

            if (pageRes.ok) {
                const html = await pageRes.text();
                const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                if (titleMatch && titleMatch[1]) {
                    fetchedTitle = titleMatch[1].trim();
                }

                // Extract meta description or body snippets
                const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*?)["']/i);
                if (metaDescMatch && metaDescMatch[1]) {
                    fetchedContent = metaDescMatch[1].trim();
                } else {
                    const textOnly = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                                         .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                                         .replace(/<[^>]+>/g, ' ')
                                         .replace(/\s+/g, ' ')
                                         .trim();
                    fetchedContent = textOnly.substring(0, 500);
                }
                fetchSuccess = true;
                explanations.push(`• Article Fetch: Successfully retrieved page "${fetchedTitle}".`);
            }
        } catch (fetchErr) {
            explanations.push(`• Live Scraping: Could not directly fetch page body (${fetchErr.message}). Evaluated domain profile.`);
        }

        // ============================================================
        // SOURCE CREDIBILITY (domain-based)
        // ============================================================
        const trustedDomains = {
            'reuters.com': 96, 'apnews.com': 96, 'bbc.com': 93, 'bbc.co.uk': 93,
            'nytimes.com': 91, 'theguardian.com': 90, 'washingtonpost.com': 88,
            'cnn.com': 82, 'npr.org': 92, 'who.int': 97, 'cdc.gov': 96,
            'nasa.gov': 98, 'nature.com': 97, 'ndtv.com': 80, 'thehindu.com': 88,
            'indiatoday.in': 78, 'timesofindia.com': 78, 'aljazeera.com': 82,
            'dw.com': 85, 'france24.com': 84, 'economist.com': 90,
            'bloomberg.com': 88, 'ft.com': 88
        };

        const unreliableDomains = [
            'infowars.com', 'naturalnews.com', 'beforeitsnews.com',
            'worldnewsdailyreport.com', 'empirenews.net', 'huzlers.com',
            'nationalreport.net', 'abcnews.com.co'
        ];

        let sourceScore = 45; // unknown default
        let isTrusted = false;
        let isUnreliable = false;

        // Check unreliable first
        if (unreliableDomains.some(d => parsedDomain.includes(d))) {
            sourceScore = 5;
            isUnreliable = true;
            explanations.push(`• Source Reputation: ⚠️ WARNING — "${parsedDomain}" is a known misinformation source.`);
        } else {
            // Check trusted
            for (const [domain, score] of Object.entries(trustedDomains)) {
                if (parsedDomain.includes(domain)) {
                    sourceScore = score;
                    isTrusted = true;
                    explanations.push(`• Source Reputation: ✅ "${parsedDomain}" is a recognized, authoritative news organization.`);
                    break;
                }
            }
            if (!isTrusted) {
                // Domain pattern analysis
                if (parsedDomain.match(/\.(gov|edu)$/)) {
                    sourceScore = 85;
                    explanations.push(`• Source Reputation: Government/educational domain "${parsedDomain}".`);
                } else if (parsedDomain.match(/\.org$/)) {
                    sourceScore = 60;
                    explanations.push(`• Source Reputation: Organization domain "${parsedDomain}".`);
                } else if (parsedDomain.match(/\.(click|buzz|xyz|top|gq|tk)$/) ||
                           parsedDomain.includes('truth') || parsedDomain.includes('patriot') ||
                           parsedDomain.includes('freedom-news') || parsedDomain.includes('real-news')) {
                    sourceScore = 15;
                    explanations.push(`• Source Reputation: ⚠️ Suspicious domain pattern "${parsedDomain}".`);
                } else {
                    explanations.push(`• Source Reputation: "${parsedDomain}" — unverified domain, moderate trust.`);
                }
            }
        }

        // ============================================================
        // ANALYZE FETCHED CONTENT (dynamic scoring)
        // ============================================================
        const fullText = (fetchedTitle + ' ' + fetchedContent).toLowerCase();
        const wordCount = fetchedContent.trim().split(/\s+/).length;

        // Clickbait analysis on fetched title
        let clickbaitScore = 100;
        const clickbaitWords = [
            'shocking', 'miracle', 'doctors hate', 'banned',
            "won't believe", 'secret', 'wake up', 'urgent',
            'click here', 'jaw dropping', 'mind blowing', 'exposed',
            'must read', 'gone viral', 'unbelievable', 'breaking:'
        ];

        let cbCount = 0;
        clickbaitWords.forEach(w => {
            if (fullText.includes(w)) {
                cbCount++;
                clickbaitScore -= 15;
            }
        });
        if (cbCount > 0) {
            explanations.push(`• Clickbait: ${cbCount} sensationalist pattern(s) found in title/content.`);
        }

        // Sentiment analysis
        let sentimentScore = 100;
        const emotionalWords = ['horrifying', 'outrageous', 'catastrophic', 'disgusting',
            'terrifying', 'alarming', 'devastating', 'horrific', 'furious'];
        const biasWords = ['deep state', 'conspiracy', 'cover up', 'hoax', 'plandemic',
            'they are hiding', 'share before deleted', 'banned video', 'secret cure'];

        emotionalWords.forEach(w => { if (fullText.includes(w)) sentimentScore -= 8; });
        biasWords.forEach(w => { if (fullText.includes(w)) sentimentScore -= 12; });

        // NLP score based on content quality
        let nlpScore = 50;
        const crediblePhrases = ['according to', 'study shows', 'researchers found',
            'official statement', 'confirmed', 'verified', 'data shows',
            'published in', 'peer reviewed', 'scientists'];
        const fakePhrases = ['they don\'t want you', 'share before deleted',
            'secret cure', 'miracle cure', 'wake up', 'forwarded as received'];

        crediblePhrases.forEach(p => { if (fullText.includes(p)) nlpScore += 6; });
        fakePhrases.forEach(p => { if (fullText.includes(p)) nlpScore -= 10; });
        if (wordCount > 100) nlpScore += 10;
        else if (wordCount > 50) nlpScore += 5;
        else if (wordCount < 15) nlpScore -= 10;

        if (fetchSuccess) nlpScore += 5;

        // Grammar score based on content
        let grammarScore = 85;
        if (wordCount < 15) grammarScore -= 20;
        if (/(.)\1{3,}/.test(fetchedContent)) grammarScore -= 10;
        if (/\s{3,}/.test(fetchedContent)) grammarScore -= 10;

        // Fact check score
        let factCheckScore = 50;
        if (fullText.match(/\d+%/)) factCheckScore += 5;
        if (fullText.includes('according to')) factCheckScore += 8;
        if (fullText.includes('reuters') || fullText.includes('associated press')) factCheckScore += 12;
        if (isTrusted) factCheckScore += 15;
        if (isUnreliable) factCheckScore -= 25;

        // Clamp all scores
        clickbaitScore = Math.max(0, Math.min(100, clickbaitScore));
        sentimentScore = Math.max(0, Math.min(100, sentimentScore));
        grammarScore = Math.max(0, Math.min(100, grammarScore));
        sourceScore = Math.max(0, Math.min(100, sourceScore));
        nlpScore = Math.max(0, Math.min(100, nlpScore));
        factCheckScore = Math.max(0, Math.min(100, factCheckScore));

        // Overall — source credibility is most important for URL analysis
        const overallScore = Math.round(
            (sourceScore * 0.35) +
            (clickbaitScore * 0.15) +
            (nlpScore * 0.15) +
            (sentimentScore * 0.10) +
            (grammarScore * 0.10) +
            (factCheckScore * 0.15)
        );

        let status = 'REAL';
        let statusDisplay = 'Verified Real News';
        let statusColor = '#10b981';

        if (overallScore < 40) {
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
            title: fetchedTitle,
            content: fetchedContent,
            sourceUrl: url,
            platform: parsedDomain,
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
                    'Source Credibility': sourceScore,
                    'Clickbait Detection': clickbaitScore,
                    'NLP Analysis': nlpScore,
                    'Sentiment Analysis': sentimentScore,
                    'Grammar Check': grammarScore,
                    'Fact Check': factCheckScore
                }
            }
        });
    } catch (err) {
        return res.status(500).json({ error: 'URL analysis failed', details: err.message });
    }
};
