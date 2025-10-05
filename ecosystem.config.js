module.exports = {
  apps: [
    {
      // Development configuration
      name: 'amenties-dev',
      script: 'npm run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3006,
        NEXT_TELEMETRY_DISABLED: 1
      },
      // Development specific settings
      watch: false,
      ignore_watch: [
        'node_modules',
        '.next',
        'uploads',
        'logs'
      ],
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/dev-error.log',
      out_file: './logs/dev-out.log',
      log_file: './logs/dev-combined.log',
      merge_logs: true
    },
    {
      // Production configuration
      name: 'amenties-prod',
      script: 'npm start',
      env: {
        NODE_ENV: 'production',
        PORT: 3006
      },
      // Production optimizations
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      max_memory_restart: '2G',
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      restart_delay: 4000,
      
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/prod-error.log',
      out_file: './logs/prod-out.log',
      log_file: './logs/prod-combined.log',
      merge_logs: true,
      
      // Health monitoring
      listen_timeout: 8000,
      kill_timeout: 5000,
      
      // Process management
      ignore_watch: [
        'node_modules',
        'uploads',
        'logs'
      ]
    },
    {
      // Staging configuration (optional)
      name: 'amenties-staging',
      script: 'npm start',
      env: {
        NODE_ENV: 'staging',
        PORT: 3006
      },
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '1.5G',
      min_uptime: '10s',
      max_restarts: 5,
      autorestart: true,
      restart_delay: 2000,
      
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/staging-error.log',
      out_file: './logs/staging-out.log',
      log_file: './logs/staging-combined.log',
      merge_logs: true
    }
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/master',
      repo: 'git@github.com:your-username/your-repo.git',
      path: '/var/www/production',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },
    staging: {
      user: 'node',
      host: 'staging-server.com',
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/your-repo.git',
      path: '/var/www/staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging'
    }
  }
};