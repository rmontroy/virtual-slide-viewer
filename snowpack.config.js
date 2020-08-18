module.exports = {
  "extends": "@snowpack/app-scripts-react",
  "plugins": [],
  "buildOptions": {
    "clean": true,
    "minify": false
  },
  "mount": {
    "js": "/js",
    "css": "/css",
    "public": "/",
    "viewer": "/viewer"
  },
  "installOptions": {
    "rollup": {
      "dedupe": ['rc-tooltip'] // work-around for @rollup/plugin-commonjs bugs
    }
  }
}
