// Vercel Serverless Function: /api/auth/login
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { usernameOrEmail, password } = req.body || {};

        if (!usernameOrEmail || !password) {
            return res.status(400).json({ error: 'Username/email and password are required' });
        }

        const username = usernameOrEmail.includes('@') ? usernameOrEmail.split('@')[0] : usernameOrEmail;
        const userId = 'usr_' + Date.now();
        const token = 'jwt_' + Math.random().toString(36).substring(2) + Date.now().toString(36);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            userId: userId,
            username: username,
            email: usernameOrEmail.includes('@') ? usernameOrEmail : `${username}@fakeshield.ai`,
            fullName: username,
            role: 'ROLE_USER'
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};
