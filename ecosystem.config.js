module.exports = {
  apps: [
    {
      name: 'amenties-rozgarhub',
      script: 'npm',
      args: 'start',
      interpreter: 'none',
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
    }
  ]
};