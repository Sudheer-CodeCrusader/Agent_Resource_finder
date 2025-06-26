import express from 'express';
import kickoffRoute from './routes/kickoff.js';
import statusRoute from './routes/status.js';
import auth from './middleware/auth.js';

const app = express();
app.use(express.json({ limit: '2mb' }));

app.use(auth);
app.use('/', kickoffRoute);
app.use('/', statusRoute);

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`)); 