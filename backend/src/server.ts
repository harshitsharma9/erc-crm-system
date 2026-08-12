import app from './app';
import pool from './config/postgres';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET must be configured before the server can start.');
    }

    // Test database connection
    await pool.query('SELECT 1');
    console.log('Successfully connected to the database.');

    const server = app.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Handle graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        await pool.end();
        console.log('Database connection closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    await pool.end();
    process.exit(1);
  }
}

bootstrap();
