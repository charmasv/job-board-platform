import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Job Board API is running!');
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'OK', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'FAILED', database: 'disconnected' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});