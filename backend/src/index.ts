import express from 'express';
import { PrismaClient } from '@prisma/client';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware to parse JSON bodies
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.send('Job Board API is running!');
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const startTime = Date.now();
  const healthData: any = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime().toFixed(2) + ' seconds',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    nodeVersion: process.version,
    platform: process.platform,
    database: 'checking...',
    responseTime: 'pending'
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    healthData.database = 'connected';
    
    const memoryUsage = process.memoryUsage();
    healthData.memory = {
      rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`
    };
    
    const cpuUsage = process.cpuUsage();
    healthData.cpu = {
      user: `${(cpuUsage.user / 1000).toFixed(2)} ms`,
      system: `${(cpuUsage.system / 1000).toFixed(2)} ms`
    };
    
    healthData.responseTime = `${Date.now() - startTime} ms`;
    
    res.json(healthData);
  } catch (error: any) {
    healthData.status = 'ERROR';
    healthData.error = error.message || 'Unknown error';
    healthData.database = 'disconnected';
    healthData.responseTime = `${Date.now() - startTime} ms`;
    
    console.error('Health check failed:', error);
    res.status(503).json(healthData);
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Test endpoint works',
    timestamp: new Date().toISOString(),
    numbers: [1, 2, 3],
    nested: { 
      key: 'value',
      boolean: true,
      nullValue: null
    }
  });
});

// JOBS API ROUTES

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        employer: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get single job by ID
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        employer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Create a new job
app.post('/api/jobs', async (req, res) => {
  try {
    const { title, description, company, location, salary, employerId } = req.body;
    
    const job = await prisma.job.create({
      data: {
        title,
        description,
        company,
        location,
        salary: salary ? parseInt(salary) : null,
        employer: { connect: { id: parseInt(employerId) } }
      },
      include: {
        employer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Update a job
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const { title, description, company, location, salary } = req.body;
    
    const job = await prisma.job.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title,
        description,
        company,
        location,
        salary: salary ? parseInt(salary) : null
      },
      include: {
        employer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete a job
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    await prisma.job.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`💼 Jobs API: http://localhost:3000/api/jobs`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Terminating gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});