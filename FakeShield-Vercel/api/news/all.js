// Serverless API for Recent News Feed
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const sampleFeed = [
        {
            id: 101,
            title: "NASA Webb Telescope Detects Water Vapor Around Distant Exoplanet",
            content: "According to official NASA reports, spectral data confirms water vapor present on exoplanet WASP-96b.",
            sourceUrl: "https://nasa.gov/news/webb-water-vapor",
            platform: "News Website",
            credibilityScore: 92.4,
            status: "REAL",
            submittedAt: new Date(Date.now() - 3600000).toISOString(),
            explanation: "Verified by official NASA scientific data release."
        },
        {
            id: 102,
            title: "SHOCKING: Miracle Water Trick Cures All Diseases Overnight!",
            content: "Secret government banned video reveals 1 trick doctors don't want you to know. Share immediately!",
            sourceUrl: "http://miracle-trick.click",
            platform: "Facebook",
            credibilityScore: 18.2,
            status: "FAKE",
            submittedAt: new Date(Date.now() - 7200000).toISOString(),
            explanation: "Excessive sensationalism, zero scientific basis, spam domain."
        },
        {
            id: 103,
            title: "Government Announces Sudden Nationwide Internet Outage Tonight",
            content: "Forwarded as received: Total blackout of 5G and Wi-Fi from 12 AM.",
            sourceUrl: "",
            platform: "WhatsApp",
            credibilityScore: 38.5,
            status: "SUSPICIOUS",
            submittedAt: new Date(Date.now() - 10800000).toISOString(),
            explanation: "Unverified viral chain message without official source."
        }
    ];

    return res.status(200).json(sampleFeed);
};
