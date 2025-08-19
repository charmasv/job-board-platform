import express from 'express';
import { PrismaClient } from '@prisma/client';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Prisma Client with error handling
let prisma: PrismaClient;
try {
  prisma = new PrismaClient();
  console.log('✅ Prisma Client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Prisma Client:', error);
  process.exit(1); // Exit if Prisma fails to initialize
}

// Middleware to parse JSON bodies
app.use(express.json());

// Root endpoint - Simple status check
app.get('/', (req, res) => {
  res.send('Job Board API is running!');
});

// Enhanced health check endpoint
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
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    healthData.database = 'connected';
    
    // Add memory usage
    const memoryUsage = process.memoryUsage();
    healthData.memory = {
      rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`
    };
    
    // Add CPU usage
    const cpuUsage = process.cpuUsage();
    healthData.cpu = {
      user: `${(cpuUsage.user / 1000).toFixed(2)} ms`,
      system: `${(cpuUsage.system / 1000).toFixed(2)} ms`
    };
    
    // Calculate response time
    healthData.responseTime = `${Date.now() - startTime} ms`;
    
    // Successful response
    res.json(healthData);
  } catch (error: any) {
    // Error handling
    healthData.status = 'ERROR';
    healthData.error = error.message || 'Unknown error';
    healthData.database = 'disconnected';
    healthData.responseTime = `${Date.now() - startTime} ms`;
    
    // Log detailed error to console
    console.error('❌ Health check failed:', error);
    
    // Error response
    res.status(503).json(healthData);
  }
});

// Test endpoint to verify JSON serialization
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


console.log("Available routes: /, /health, /test");

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
});

// Handle shutdown gracefully
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