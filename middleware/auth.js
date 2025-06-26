export default function (req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = auth.split(' ')[1];
  // Replace with your real token
  if (token !== 'sudheertesttoken$%^') {
    return res.status(403).json({ error: 'Invalid token' });
  }
  next();
} 