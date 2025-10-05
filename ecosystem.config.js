module.exports = {
  apps: [
    {
      name: 'amenties-rozgarhub-prod',
      script: 'npm',
      args: 'start',
      cwd: '/home/rozgarhub-amenties/htdocs/amenties.rozgarhub.co/Client-software',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3006
      },
      error_file: './logs/prod-error.log',
      out_file: './logs/prod-out.log',
      log_file: './logs/prod-combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm Z'
    },
    {
      name: 'amenties-rozgarhub-dev',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/rozgarhub-amenties/htdocs/amenties.rozgarhub.co/Client-software',
      instances: 1,
      autorestart: true,
      watch: true,
      ignore_watch: [
        'node_modules',
        '.next',
        'logs',
        '.git'
      ],
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3006
      },
      error_file: './logs/dev-error.log',
      out_file: './logs/dev-out.log',
      log_file: './logs/dev-combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm Z'
    }
  ]
};