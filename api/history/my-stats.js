// Vercel Serverless History Stats API
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') return res.status(200).end();

    return res.status(200).json({
        total: 12,
        real: 7,
        fake: 3,
        suspicious: 2,
        username: "Guest",
        isGuest: true
    });
};
