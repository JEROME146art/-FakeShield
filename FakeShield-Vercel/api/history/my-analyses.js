// Vercel Serverless History Analyses API
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const sampleHistory = [
        {
            id: 201,
            type: "text",
            title: "NASA Webb Telescope Detects Water Vapor Around Distant Exoplanet",
            content: "According to official statement by NASA scientists, spectral data confirms atmospheric water vapor on exoplanet WASP-96b.",
            sourceUrl: "https://nasa.gov/news/webb-water-vapor-discovery",
            platform: "News Website",
            credibilityScore: 94.0,
            status: "REAL",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            explanation: "Verified by official NASA scientific data release."
        },
        {
            id: 202,
            type: "url",
            title: "BBC News - Top Stories & World Coverage",
            content: "Live global news report from accredited international correspondents.",
            sourceUrl: "https://bbc.com/news",
            platform: "bbc.com",
            credibilityScore: 90.0,
            status: "REAL",
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            explanation: "Source is a recognized credible news organization."
        },
        {
            id: 203,
            type: "image",
            title: "breaking_viral_news_post.png",
            filename: "breaking_viral_news_post.png",
            fileSize: 1024 * 320,
            extractedText: "EMERGENCY: Secret cure hidden by authorities! Share before taken down!",
            credibilityScore: 22.0,
            status: "FAKE",
            createdAt: new Date(Date.now() - 14400000).toISOString(),
            explanation: "Sensationalist language and manipulated typography detected in image text."
        }
    ];

    return res.status(200).json(sampleHistory);
};
