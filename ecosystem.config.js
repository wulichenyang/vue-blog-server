module.exports = {
  apps: [{
    name: "muse-forum-server",
    script: "./bin/www",
    watch: true,
    env_production: {
      "PORT": 3003,
      "NODE_ENV": "production",
    }
  }]
}