module.exports = {
  "extends": "@snowpack/app-scripts-react",
  "plugins": [],
  "buildOptions": {
    "clean": true,
    "minify": false
  },
  "mount": {
    'src/metadata': '/',
    'src/viewer': '/viewer'
  },
}
