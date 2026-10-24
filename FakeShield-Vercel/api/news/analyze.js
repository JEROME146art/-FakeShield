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
        const raw = title + ' ' + content;
        const words = raw.trim().split(/\s+/);
        const wordCount = words.length;
        const explanations = [];

        // ============================================================
        // 1. CLICKBAIT DETECTION (starts at 100, deductions apply)
        // ============================================================
        let clickbaitScore = 100;

        const clickbaitWords = [
            'shocking', 'miracle', 'doctors hate', 'banned video',
            "won't believe", 'secret exposed', 'wake up', 'urgent warning',
            'forward to', 'share before', 'click here', 'what they',
            'one simple trick', 'you need to know', 'jaw dropping',
            'mind blowing', 'this will change', 'number 5 will',
            'exposed', 'must read', 'gone viral', 'unbelievable',
            'breaking:', 'exclusive:', 'alert', 'they don\'t want you'
        ];

        let clickbaitCount = 0;
        const foundClickbait = [];
        clickbaitWords.forEach(w => {
            if (fullText.includes(w)) {
                clickbaitCount++;
                clickbaitScore -= 15;
                foundClickbait.push(w);
            }
        });

        // Excessive uppercase detection
        const capsRatio = (raw.replace(/[^A-Z]/g, '').length) / (raw.length || 1);
        if (capsRatio > 0.5 && raw.length > 20) {
            clickbaitScore -= 30;
            explanations.push('• Typography: Heavy uppercase usage — typical of sensationalist content.');
        } else if (capsRatio > 0.35 && raw.length > 20) {
            clickbaitScore -= 20;
            explanations.push('• Typography: Excessive uppercase letters detected.');
        }

        // Excessive exclamation/question marks
        const exclaimMatches = raw.match(/!{2,}/g) || [];
        const questionMatches = raw.match(/\?{2,}/g) || [];
        if (exclaimMatches.length > 0 || questionMatches.length > 0) {
            clickbaitScore -= 15;
            explanations.push('• Punctuation: Excessive exclamation/question marks detected.');
        }

        if (clickbaitCount > 0) {
            explanations.push(`• Clickbait Signals: Found ${clickbaitCount} sensationalist phrase(s): "${foundClickbait.slice(0, 3).join('", "')}".`);
        } else {
            explanations.push('• Clickbait Check: Clean, neutral phrasing detected.');
        }

        // ============================================================
        // 2. SENTIMENT & EMOTION ANALYSIS (starts at 100, deductions)
        // ============================================================
        let sentimentScore = 100;

        const emotionalWords = {
            'horrifying': 8, 'outrageous': 8, 'catastrophic': 7, 'disgusting': 8,
            'terrifying': 7, 'alarming': 5, 'devastating': 6, 'horrific': 7,
            'outrage': 6, 'enraged': 6, 'furious': 5, 'angry': 4,
            'kill': 3, 'destroy': 4, 'panic': 5, 'chaos': 4, 'doom': 5
        };

        const biasWords = {
            'deep state': 12, 'conspiracy': 10, 'cover up': 10,
            'fake media': 10, 'hoax': 8, 'plandemic': 15,
            'they are hiding': 10, 'mainstream media lies': 12,
            'wake up people': 10, 'share before deleted': 12,
            'banned video': 10, 'secret cure': 12, 'miracle cure': 12,
            'corrupt': 6, 'evil': 6, 'puppet': 7, 'brainwash': 10,
            'sheeple': 12, 'propaganda': 5
        };

        let emotionalHits = 0;
        let biasHits = 0;

        Object.entries(emotionalWords).forEach(([word, penalty]) => {
            if (fullText.includes(word)) {
                sentimentScore -= penalty;
                emotionalHits++;
            }
        });

        Object.entries(biasWords).forEach(([word, penalty]) => {
            if (fullText.includes(word)) {
                sentimentScore -= penalty;
                biasHits++;
            }
        });

        if (emotionalHits > 0) {
            explanations.push(`• Emotional Language: ${emotionalHits} highly charged word(s) detected — indicates manipulative framing.`);
        }
        if (biasHits > 0) {
            explanations.push(`• Bias & Conspiracy Markers: ${biasHits} known misinformation phrase(s) found.`);
        }
        if (emotionalHits === 0 && biasHits === 0) {
            explanations.push('• Sentiment Analysis: Neutral, factual tone detected.');
        }

        // ============================================================
        // 3. SOURCE CREDIBILITY (dynamic based on URL)
        // ============================================================
        let sourceScore = 30; // default: no source

        const credibleDomains = {
            'reuters.com': 95, 'apnews.com': 95, 'bbc.com': 92, 'bbc.co.uk': 92,
            'nytimes.com': 90, 'theguardian.com': 90, 'washingtonpost.com': 88,
            'npr.org': 92, 'who.int': 96, 'cdc.gov': 96, 'nasa.gov': 98,
            'nature.com': 97, 'thehindu.com': 88, 'ndtv.com': 80,
            'indiatoday.in': 78, 'timesofindia.com': 78, 'hindustantimes.com': 78,
            'aljazeera.com': 82, 'dw.com': 85, 'france24.com': 84,
            'economist.com': 90, 'ft.com': 88, 'bloomberg.com': 88,
            'sciencedirect.com': 95, 'pubmed.ncbi.nlm.nih.gov': 96
        };

        const unreliableDomains = [
            'infowars.com', 'naturalnews.com', 'beforeitsnews.com',
            'worldnewsdailyreport.com', 'empirenews.net', 'huzlers.com',
            'nationalreport.net', 'abcnews.com.co', 'newsbreakhealth.com'
        ];

        if (sourceUrl) {
            const srcLower = sourceUrl.toLowerCase();

            // Check unreliable first
            const isUnreliable = unreliableDomains.some(d => srcLower.includes(d));
            if (isUnreliable) {
                sourceScore = 5;
                explanations.push(`• Source Verification: ⚠️ WARNING — Known misinformation domain detected (${sourceUrl}).`);
            } else {
                // Check credible
                let matched = false;
                for (const [domain, score] of Object.entries(credibleDomains)) {
                    if (srcLower.includes(domain)) {
                        sourceScore = score;
                        matched = true;
                        explanations.push(`• Source Verification: ✅ Reputable domain verified (${domain}).`);
                        break;
                    }
                }
                if (!matched) {
                    // Analyze domain patterns
                    sourceScore = 45;
                    if (srcLower.match(/\.(gov|edu|ac\.\w+)$/)) {
                        sourceScore = 85;
                        explanations.push(`• Source Verification: Government/educational domain detected (${sourceUrl}).`);
                    } else if (srcLower.match(/\.(org)$/)) {
                        sourceScore = 60;
                        explanations.push(`• Source Verification: Organization domain (${sourceUrl}), moderate trust.`);
                    } else if (srcLower.includes('.click') || srcLower.includes('.buzz') ||
                               srcLower.includes('.xyz') || srcLower.includes('.top') ||
                               srcLower.includes('free') || srcLower.includes('truth')) {
                        sourceScore = 15;
                        explanations.push(`• Source Verification: ⚠️ Suspicious domain pattern detected (${sourceUrl}).`);
                    } else {
                        explanations.push(`• Source Verification: Unverified external domain (${sourceUrl}).`);
                    }
                }
            }
        } else {
            explanations.push('• Source Verification: No source URL provided — reduces credibility score.');
        }

        // ============================================================
        // 4. GRAMMAR & STRUCTURE ANALYSIS (dynamic based on content)
        // ============================================================
        let grammarScore = 100;

        // Very short content
        if (wordCount < 10) {
            grammarScore -= 30;
            explanations.push('• Length: Content is extremely short for reliable linguistic verification.');
        } else if (wordCount < 25) {
            grammarScore -= 15;
            explanations.push('• Length: Content is short, limited linguistic verification possible.');
        } else if (wordCount > 100) {
            grammarScore += 0; // no bonus, just no penalty for good length
            explanations.push('• Length: Adequate article length for thorough analysis.');
        }

        // Repeated characters (e.g. "OMG!!!!!!")
        const repeatedCharMatches = raw.match(/(.)\1{3,}/g) || [];
        if (repeatedCharMatches.length > 2) {
            grammarScore -= 15;
        }

        // Multiple spaces / poor formatting
        if (/\s{3,}/.test(raw)) {
            grammarScore -= 10;
        }

        // Sentence count
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length < 2 && wordCount > 10) {
            grammarScore -= 10;
        }

        // Check for all-caps words (5+ letters)
        const allCapsWords = raw.match(/\b[A-Z]{5,}\b/g) || [];
        if (allCapsWords.length > 3) {
            grammarScore -= 15;
        }

        // ============================================================
        // 5. NLP CONTEXTUAL ANALYSIS (dynamic, not static!)
        // ============================================================
        let nlpScore = 50; // Start neutral

        // Credibility-boosting phrases
        const crediblePhrases = [
            'according to', 'study shows', 'researchers found',
            'official statement', 'confirmed', 'verified',
            'reports indicate', 'sources say', 'announced',
            'published in', 'data shows', 'statistics',
            'peer reviewed', 'clinical trial', 'evidence suggests',
            'journal of', 'university of', 'scientists',
            'research team', 'analysis reveals'
        ];

        // Fake/misleading phrases
        const fakePhrases = [
            'they don\'t want you to know', 'share before deleted',
            'banned', 'what they won\'t tell you', 'secret cure',
            'miracle cure', 'fake news media', 'deep state',
            'wake up', 'just heard from a friend', 'forwarded as received',
            'don\'t trust the media', 'mainstream media won\'t show',
            '100% guaranteed', 'no side effects', 'free money',
            'act now before', 'limited time'
        ];

        let credibleCount = 0;
        let fakeCount = 0;

        crediblePhrases.forEach(phrase => {
            if (fullText.includes(phrase)) {
                nlpScore += 5;
                credibleCount++;
            }
        });

        fakePhrases.forEach(phrase => {
            if (fullText.includes(phrase)) {
                nlpScore -= 8;
                fakeCount++;
            }
        });

        // Content depth analysis
        if (wordCount > 150) nlpScore += 10;
        else if (wordCount > 80) nlpScore += 5;
        else if (wordCount < 20) nlpScore -= 15;

        // Presence of quotes suggests real journalism
        const quoteCount = (raw.match(/"/g) || []).length;
        if (quoteCount >= 2) nlpScore += 5;

        // Presence of numbers/statistics
        const numberCount = (raw.match(/\d+/g) || []).length;
        if (numberCount >= 2) nlpScore += 5;

        // Date references
        if (raw.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December|\d{4})\b/i)) {
            nlpScore += 3;
        }

        if (credibleCount > 0) {
            explanations.push(`• NLP Analysis: ${credibleCount} credibility-indicating phrase(s) found — suggests factual reporting.`);
        }
        if (fakeCount > 0) {
            explanations.push(`• NLP Analysis: ${fakeCount} misinformation-pattern phrase(s) detected.`);
        }
        if (credibleCount === 0 && fakeCount === 0) {
            explanations.push('• NLP Analysis: No strong credibility or misinformation signals found — inconclusive.');
        }

        // ============================================================
        // 6. FACT-CHECK SIGNAL ANALYSIS (dynamic, not static!)
        // ============================================================
        let factCheckScore = 50; // Start neutral

        // Verifiable indicators
        if (fullText.match(/\d+%/)) factCheckScore += 5;
        if (fullText.includes('according to')) factCheckScore += 8;
        if (fullText.includes('study') && fullText.includes('shows')) factCheckScore += 8;
        if (fullText.includes('reuters') || fullText.includes('associated press') ||
            fullText.includes('fact check') || fullText.includes('snopes')) {
            factCheckScore += 12;
        }
        if (fullText.includes('published') && (fullText.includes('journal') || fullText.includes('paper'))) {
            factCheckScore += 10;
        }

        // Named sources and specifics
        const hasNamedSource = fullText.match(/\b(dr\.|prof\.|professor|minister|secretary|spokesperson|director|chief)\b/);
        if (hasNamedSource) factCheckScore += 7;

        const hasLocation = fullText.match(/\b(city|state|country|district|province|ministry|department|hospital|university)\b/);
        if (hasLocation) factCheckScore += 5;

        // Unverifiable claims
        if (fullText.includes('someone told me') || fullText.includes('i heard that') ||
            fullText.includes('people are saying') || fullText.includes('everybody knows')) {
            factCheckScore -= 15;
            explanations.push('• Fact Check: Vague, unverifiable sourcing detected ("people are saying" / hearsay).');
        }

        // Absolute claims without evidence
        if (fullText.includes('100%') || fullText.includes('guaranteed') ||
            fullText.includes('always') || fullText.includes('never fails')) {
            factCheckScore -= 10;
            explanations.push('• Fact Check: Absolute/superlative claims without cited evidence.');
        }

        if (factCheckScore > 60) {
            explanations.push('• Fact Check: Multiple verifiable data points and source references found.');
        } else if (factCheckScore >= 40) {
            explanations.push('• Fact Check: Limited verifiable references — moderate confidence.');
        } else {
            explanations.push('• Fact Check: Few to no verifiable facts — low confidence.');
        }

        // Platform-specific adjustments
        if (platform === 'WhatsApp') {
            nlpScore -= 10;
            factCheckScore -= 5;
            explanations.push('• Platform: WhatsApp forward — chain messages have higher misinformation rates.');
        } else if (platform === 'Facebook') {
            nlpScore -= 5;
        }

        // ============================================================
        // CLAMP ALL SCORES to [0, 100]
        // ============================================================
        clickbaitScore = Math.max(0, Math.min(100, clickbaitScore));
        sentimentScore = Math.max(0, Math.min(100, sentimentScore));
        grammarScore = Math.max(0, Math.min(100, grammarScore));
        sourceScore = Math.max(0, Math.min(100, sourceScore));
        nlpScore = Math.max(0, Math.min(100, nlpScore));
        factCheckScore = Math.max(0, Math.min(100, factCheckScore));

        // ============================================================
        // WEIGHTED OVERALL SCORE
        // ============================================================
        const overallScore = Math.round(
            (clickbaitScore * 0.15) +
            (sentimentScore * 0.15) +
            (sourceScore * 0.20) +
            (nlpScore * 0.20) +
            (factCheckScore * 0.15) +
            (grammarScore * 0.15)
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
