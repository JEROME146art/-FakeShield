// Vercel Serverless Multi-Language Translation API
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
        const text = body.text || '';
        const source = (body.source || 'auto').toLowerCase();
        const target = (body.target || 'en').toLowerCase();

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        if (source === target) {
            return res.status(200).json({ original: text, translated: text, source, target });
        }

        const encoded = encodeURIComponent(text);
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encoded}`;

        const gRes = await fetch(url);
        if (gRes.ok) {
            const data = await gRes.json();
            if (Array.isArray(data) && Array.isArray(data[0])) {
                const translated = data[0].map(item => (Array.isArray(item) && item[0]) ? item[0] : '').join('');
                return res.status(200).json({
                    original: text,
                    translated: translated || text,
                    source,
                    target
                });
            }
        }

        // Fallback
        return res.status(200).json({ original: text, translated: text, source, target });
    } catch (e) {
        return res.status(500).json({ error: 'Translation failed', details: e.message });
    }
};
