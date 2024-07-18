module.exports = {
    apps: [
      {
        name: "simaxis",
        script: "./node_modules/.bin/ts-node",
        args: "-r tsconfig-paths/register src/index.ts",
        interpreter: "./node_modules/.bin/ts-node",
        watch: true,
        ignore_watch: ["node_modules"],
        env: {
          NODE_ENV: "development"
        },
        env_production: {
          NODE_ENV: "development"
        }
      }
    ]
  };
  