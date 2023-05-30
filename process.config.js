module.exports = {
  apps: [
    {
      name: "LAZZATFOOD",
      cwd: "./",
      script: "./server.js",
      watch: true,
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
      // 1.fork mode, 2.cluster mode
      instances: 1,
      // instances: "max",
      exec_mode: "cluster",
    },
  ],
};
