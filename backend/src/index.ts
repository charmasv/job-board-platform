import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize Prisma Client
const prisma = new PrismaClient();

// CORS middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Auth middleware to verify JWT tokens
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

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

// AUTH ENDPOINTS

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, type } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        type: type || 'JOB_SEEKER'
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user profile (protected route)
app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        type: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
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
    app.post('/api/jobs', authenticateToken, async (req: any, res) => {
      try {
        const { title, description, company, location, salary } = req.body;
        
        const job = await prisma.job.create({
          data: {
            title,
            description,
            company,
            location,
            salary: salary ? parseInt(salary) : null,
            employer: { connect: { id: req.user.userId } }
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
    app.put('/api/jobs/:id', authenticateToken, async (req: any, res) => {
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
    app.delete('/api/jobs/:id', authenticateToken, async (req: any, res) => {
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
    
    // Apply to a job
    app.post('/api/jobs/:id/apply', authenticateToken, async (req: any, res) => {
      try {
        const jobId = parseInt(req.params.id);
        const userId = req.user.userId;
    
        // Check if user already applied using findFirst (works without unique constraint)
        const existingApplication = await prisma.application.findFirst({
          where: {
            jobId: jobId,
            applicantId: userId
          }
        });
    
        if (existingApplication) {
          return res.status(400).json({ error: 'You have already applied to this job' });
        }
    
        // Create application
        const application = await prisma.application.create({
          data: {
            job: { connect: { id: jobId } },
            applicant: { connect: { id: userId } },
            status: 'PENDING'
          },
          include: {
            job: {
              include: {
                employer: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            },
            applicant: {
              select: {
                name: true,
                email: true
              }
            }
          }
        });
    
        res.status(201).json({
          message: 'Application submitted successfully',
          application
        });
      } catch (error) {
        console.error('Error applying to job:', error);
        res.status(500).json({ error: 'Failed to apply to job' });
      }
    });
    
    // APPLICATIONS ENDPOINTS
    
    // Get user's applications
    app.get('/api/applications/me', authenticateToken, async (req: any, res) => {
      try {
        const applications = await prisma.application.findMany({
          where: {
            applicantId: req.user.userId
          },
          include: {
            job: {
              include: {
                employer: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          },
          orderBy: {
            appliedAt: 'desc'
          }
        });
    
        res.json(applications);
      } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
      }
    });
    
    // Withdraw application
    app.delete('/api/applications/:id', authenticateToken, async (req: any, res) => {
      try {
        const applicationId = parseInt(req.params.id);
        
        // Verify the application belongs to the user
        const application = await prisma.application.findUnique({
          where: { id: applicationId }
        });
    
        if (!application || application.applicantId !== req.user.userId) {
          return res.status(404).json({ error: 'Application not found' });
        }
    
        await prisma.application.delete({
          where: { id: applicationId }
        });
    
        res.status(204).send();
      } catch (error) {
        console.error('Error withdrawing application:', error);
        res.status(500).json({ error: 'Failed to withdraw application' });
      }
    });
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
      console.log(`🔐 Auth API: http://localhost:3000/api/auth`);
      console.log(`💼 Jobs API: http://localhost:3000/api/jobs`);
      console.log(`📝 Applications API: http://localhost:3000/api/applications`);
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