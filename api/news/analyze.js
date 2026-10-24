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
        const title = (body.title || '').trim();
        const content = (body.content || title).trim();
        const sourceUrl = (body.sourceUrl || '').trim();
        const platform = body.platform || 'General';

        if (!title && !content) {
            return res.status(400).json({ error: 'Title or Content is required' });
        }

        const fullText = (title + ' ' + content).toLowerCase();
        const raw = title + (content && content !== title ? ' ' + content : '');
        const words = raw.trim().split(/\s+/).filter(Boolean);
        const wordCount = words.length;
        const explanations = [];

        // ============================================================
        // 1. SOURCE CREDIBILITY (0 - 100)
        // ============================================================
        let sourceScore = 20; // Base: unverified claim without source

        const credibleDomains = {
            'reuters.com': 98, 'apnews.com': 98, 'afp.com': 97,
            'bbc.com': 94, 'bbc.co.uk': 94, 'nytimes.com': 92,
            'theguardian.com': 92, 'washingtonpost.com': 90,
            'npr.org': 92, 'who.int': 98, 'cdc.gov': 98,
            'nasa.gov': 99, 'nature.com': 98, 'science.org': 98,
            'thehindu.com': 88, 'ndtv.com': 82, 'indiatoday.in': 80,
            'timesofindia.com': 78, 'hindustantimes.com': 78,
            'aljazeera.com': 85, 'dw.com': 88, 'france24.com': 86,
            'economist.com': 92, 'ft.com': 90, 'bloomberg.com': 90,
            'espn.com': 90, 'skysports.com': 88, 'fifa.com': 95,
            'sciencedirect.com': 96, 'pubmed.ncbi.nlm.nih.gov': 98
        };

        const unreliableDomains = [
            'infowars.com', 'naturalnews.com', 'beforeitsnews.com',
            'worldnewsdailyreport.com', 'empirenews.net', 'huzlers.com',
            'nationalreport.net', 'abcnews.com.co', 'newsbreakhealth.com',
            'miracle-cure', 'secret-exposed'
        ];

        let hasVerifiedSource = false;
        if (sourceUrl) {
            const srcLower = sourceUrl.toLowerCase();
            const isUnreliable = unreliableDomains.some(d => srcLower.includes(d));

            if (isUnreliable) {
                sourceScore = 5;
                explanations.push(`• Source Verification: ⚠️ Flagged misinformation or satirical domain (${sourceUrl}).`);
            } else {
                let matched = false;
                for (const [domain, score] of Object.entries(credibleDomains)) {
                    if (srcLower.includes(domain)) {
                        sourceScore = score;
                        matched = true;
                        hasVerifiedSource = true;
                        explanations.push(`• Source Verification: ✅ Recognized authoritative journalism domain (${domain}).`);
                        break;
                    }
                }
                if (!matched) {
                    if (srcLower.match(/\.(gov|edu|ac\.\w+)$/)) {
                        sourceScore = 88;
                        hasVerifiedSource = true;
                        explanations.push(`• Source Verification: Government / academic domain verified (${sourceUrl}).`);
                    } else if (srcLower.match(/\.org$/)) {
                        sourceScore = 65;
                        explanations.push(`• Source Verification: Organization domain (${sourceUrl}), moderate baseline trust.`);
                    } else if (srcLower.match(/\.(click|buzz|xyz|top|gq|tk|cf|ml)$/) ||
                               srcLower.includes('free') || srcLower.includes('miracle') ||
                               srcLower.includes('secret') || srcLower.includes('truth')) {
                        sourceScore = 10;
                        explanations.push(`• Source Verification: ⚠️ High-risk low-trust TLD pattern detected (${sourceUrl}).`);
                    } else {
                        sourceScore = 45;
                        explanations.push(`• Source Verification: Unaccredited independent web source (${sourceUrl}).`);
                    }
                }
            }
        } else {
            sourceScore = 20;
            explanations.push('• Source Verification: No canonical publisher URL or reference provided.');
        }

        // ============================================================
        // 2. CLICKBAIT & SENSATIONALISM DETECTION (0 - 100)
        // ============================================================
        let clickbaitScore = 95;

        const severeClickbait = [
            'shocking', 'miracle cure', 'doctors hate', 'banned video',
            "what they don't want you to know", 'secret exposed', 'wake up before',
            'share before deleted', 'they are hiding', 'mind blowing',
            '100% cure', 'cures all diseases', 'urgent warning'
        ];

        const mildClickbait = [
            "won't believe", 'secret', 'exposed', 'miracle', 'gone viral',
            'must read', 'click here', 'jaw dropping', 'unbelievable',
            'breaking:', 'exclusive:', 'emergency alert', 'forward to all',
            'total blackout'
        ];

        let clickbaitHits = 0;
        severeClickbait.forEach(phrase => {
            if (fullText.includes(phrase)) {
                clickbaitHits += 2;
                clickbaitScore -= 25;
            }
        });
        mildClickbait.forEach(phrase => {
            if (fullText.includes(phrase)) {
                clickbaitHits += 1;
                clickbaitScore -= 12;
            }
        });

        // Caps & exclamation check
        const capsRatio = (raw.replace(/[^A-Z]/g, '').length) / (raw.length || 1);
        if (capsRatio > 0.45 && raw.length > 15) {
            clickbaitScore -= 30;
            explanations.push('• Typography: Aggressive uppercase lettering detected (sensationalist marker).');
        } else if (capsRatio > 0.30 && raw.length > 20) {
            clickbaitScore -= 15;
        }

        const multipleExclaims = (raw.match(/[!?]{2,}/g) || []).length;
        if (multipleExclaims > 0) {
            clickbaitScore -= 20;
            explanations.push('• Punctuation: Dramatic multiple exclamation/question marks detected.');
        }

        if (clickbaitHits > 0) {
            explanations.push(`• Clickbait Signals: ${clickbaitHits} sensationalist phrasing markers detected.`);
        } else {
            explanations.push('• Clickbait Check: Clean, non-sensationalist headline formatting.');
        }

        // ============================================================
        // 3. SENTIMENT & COGNITIVE MANIPULATION (0 - 100)
        // ============================================================
        let sentimentScore = 90;

        const highEmotionWords = [
            'horrifying', 'outrageous', 'catastrophic', 'disgusting',
            'terrifying', 'alarming', 'devastating', 'horrific',
            'enraged', 'furious', 'panic', 'doom', 'destruction'
        ];

        const conspiracyWords = [
            'deep state', 'conspiracy', 'cover up', 'fake media', 'hoax',
            'plandemic', 'mainstream media lies', 'wake up people',
            'corrupt fake news', 'corrupt media', 'brainwash', 'sheeple',
            'they are poisoning', 'depopulation', 'agenda 2030'
        ];

        let emotionHits = 0;
        highEmotionWords.forEach(w => {
            if (fullText.includes(w)) {
                emotionHits++;
                sentimentScore -= 10;
            }
        });

        let conspiracyHits = 0;
        conspiracyWords.forEach(w => {
            if (fullText.includes(w)) {
                conspiracyHits++;
                sentimentScore -= 20;
            }
        });

        if (conspiracyHits > 0) {
            explanations.push(`• Bias & Conspiracy: ${conspiracyHits} known conspiracy / alarmist narrative markers found.`);
        }
        if (emotionHits > 0) {
            explanations.push(`• Emotional Tone: Emotionally charged rhetoric detected (${emotionHits} terms).`);
        }
        if (emotionHits === 0 && conspiracyHits === 0) {
            explanations.push('• Emotional Tone: Measured, objective journalistic syntax.');
        }

        // ============================================================
        // 4. LINGUISTIC, GRAMMAR & DEPTH ANALYSIS (0 - 100)
        // ============================================================
        let grammarScore = 80;

        if (wordCount < 5) {
            grammarScore = 30;
            explanations.push('• Content Depth: Extremely brief fragment (< 5 words). Lacks editorial body.');
        } else if (wordCount < 12) {
            grammarScore = 50;
            explanations.push('• Content Depth: Isolated claim snippet without corroborating context.');
        } else if (wordCount >= 40) {
            grammarScore = 85;
            explanations.push('• Content Depth: Detailed multi-sentence article context provided.');
        }

        // Repeated characters check (e.g. "12222222", "goaaaal", "omgggg")
        if (/(.)\1{4,}/.test(raw)) {
            grammarScore -= 25;
            explanations.push('• Formatting: Repeated character anomalies detected (informal social media pattern).');
        }

        // Multiple spaces or broken punctuation
        if (/\s{3,}/.test(raw)) {
            grammarScore -= 10;
        }

        // ============================================================
        // 5. NLP CONTEXT & VERIFIABILITY ANALYSIS (0 - 100)
        // ============================================================
        let nlpScore = 40; // Neutral base

        const crediblePatterns = [
            'according to', 'study shows', 'researchers found',
            'official statement', 'confirmed by', 'verified reports',
            'reports indicate', 'sources say', 'announced that',
            'published in', 'data shows', 'peer-reviewed',
            'nasa', 'scientists', 'clinical trial', 'reuters',
            'associated press', 'ministry of', 'department of',
            'university research', 'investigation revealed'
        ];

        const unverifiedClaimPatterns = [
            'people are saying', 'i heard that', 'forwarded as received',
            'just leaked', 'secret news', 'they don\'t want you to know',
            'share to all groups', 'emergency curfew', 'internet shutting down'
        ];

        let credHits = 0;
        crediblePatterns.forEach(p => {
            if (fullText.includes(p)) {
                credHits++;
                nlpScore += 12;
            }
        });

        let unverifiedHits = 0;
        unverifiedClaimPatterns.forEach(p => {
            if (fullText.includes(p)) {
                unverifiedHits++;
                nlpScore -= 15;
            }
        });

        // Numerical anomaly check (e.g., "goals 1222", "score 1000 goals")
        // Extreme sports/celebrity claims without sources are classic rumors
        const sportsRumor = fullText.match(/\b(messi|mesii|ronaldo|cr7|neymar|haaland|mbappe)\b/i);
        const extremeNumber = fullText.match(/\b(1\d{3,}|2\d{3,}|[3-9]\d{2,})\s*(goals|points|wickets|runs|records|kills|crore)\b/i) ||
                              fullText.match(/\b(goals|score|scored)\s*(1\d{3,}|2\d{3,}|[3-9]\d{2,})\b/i);

        if (sportsRumor && extremeNumber) {
            nlpScore -= 25;
            explanations.push('• Numerical Plausibility: Unverified extreme statistical milestone without sports federation citations.');
        }

        // Quoted statements and statistical data
        if ((raw.match(/"[^"]+"/g) || []).length > 0) nlpScore += 8;
        if (fullText.match(/\b\d+(\.\d+)?%\b/)) nlpScore += 6;

        if (credHits > 0) {
            explanations.push(`• Verifiable Syntax: ${credHits} corroborating attribution marker(s) found ("according to", citations).`);
        } else if (wordCount < 15 && !hasVerifiedSource) {
            nlpScore = Math.min(nlpScore, 35);
            explanations.push('• Verifiable Syntax: No accredited institutional attribution or author credentials.');
        }

        // ============================================================
        // 6. FACT CHECK SIGNALS & CLAIMS AUDIT (0 - 100)
        // ============================================================
        let factCheckScore = 40;

        if (hasVerifiedSource) {
            factCheckScore += 35;
        }

        // Absolutist claims without evidence
        if (fullText.match(/\b(100% cure|cures all|guaranteed|total blackout|shutting down all)\b/i)) {
            factCheckScore -= 25;
            explanations.push('• Fact Check Signals: Absolutist superlative assertion without clinical or governmental Gazette notice.');
        }

        // WhatsApp forward rumor penalty
        if (platform === 'WhatsApp' || fullText.includes('forwarded') || fullText.includes('share to all')) {
            factCheckScore -= 15;
            nlpScore -= 10;
            explanations.push('• Propagation Channel: WhatsApp chain forward profile — elevated risk of viral misinformation.');
        }

        // Vague unverified claim penalty (short text, no source, no quotes)
        if (!sourceUrl && wordCount < 10) {
            factCheckScore = Math.min(factCheckScore, 30);
            nlpScore = Math.min(nlpScore, 35);
        }

        // ============================================================
        // CLAMP ALL SCORES TO [0, 100]
        // ============================================================
        clickbaitScore = Math.max(0, Math.min(100, clickbaitScore));
        sentimentScore = Math.max(0, Math.min(100, sentimentScore));
        grammarScore = Math.max(0, Math.min(100, grammarScore));
        sourceScore = Math.max(0, Math.min(100, sourceScore));
        nlpScore = Math.max(0, Math.min(100, nlpScore));
        factCheckScore = Math.max(0, Math.min(100, factCheckScore));

        // ============================================================
        // COMPOSITE OVERALL SCORE COMPUTATION
        // ============================================================
        let overallScore = Math.round(
            (sourceScore * 0.30) +
            (nlpScore * 0.25) +
            (factCheckScore * 0.20) +
            (clickbaitScore * 0.10) +
            (sentimentScore * 0.08) +
            (grammarScore * 0.07)
        );

        // HARD RULES FOR INTEGRITY:
        // Rule 1: A brief unverified snippet with NO source URL can NEVER be rated "REAL" (max 48%)
        if (!sourceUrl && wordCount < 15) {
            overallScore = Math.min(overallScore, 42);
        } else if (!sourceUrl && !hasVerifiedSource) {
            overallScore = Math.min(overallScore, 58); // At best SUSPICIOUS without any source link
        }

        // Rule 2: If clickbait or conspiracy hits are severe, cap at 30%
        if (clickbaitHits >= 2 || conspiracyHits >= 1) {
            overallScore = Math.min(overallScore, 32);
        }

        // Rule 3: Extreme sports rumors without sports news source capped at 28%
        if (sportsRumor && extremeNumber && !sourceUrl) {
            overallScore = Math.min(overallScore, 24);
        }

        // Clamp overall
        overallScore = Math.max(5, Math.min(99, overallScore));

        // ============================================================
        // VERDICT & BADGE DETERMINATION
        // ============================================================
        let status = 'REAL';
        let statusDisplay = 'Verified Authentic News';
        let statusColor = '#10b981';

        if (overallScore < 40) {
            status = 'FAKE';
            statusDisplay = 'High-Risk Misinformation / Hoax';
            statusColor = '#ef4444';
        } else if (overallScore < 72) {
            status = 'SUSPICIOUS';
            statusDisplay = 'Suspicious / Unverified Claim';
            statusColor = '#f59e0b';
        }

        return res.status(200).json({
            id: Date.now(),
            title: title || 'Untitled Claim',
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
