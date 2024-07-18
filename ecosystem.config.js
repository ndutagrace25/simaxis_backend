module.exports = {
    apps: [{
      name: "simaxis",
      script: "./dist/index.js",
      watch: true,
      env: {
        "NODE_ENV": "development",
      }
    }]
  }