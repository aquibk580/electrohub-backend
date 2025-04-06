module.exports = {
  apps: [
    {
      name: 'express-server',
      script: 'dist/app.js', 
      watch: false,
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
