// Serverless API for Statistics
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') return res.status(200).end();

    return res.status(200).json({
        total: 128,
        real: 84,
        fake: 29,
        suspicious: 15,
        unverified: 0
    });
};
