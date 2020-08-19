module.exports = {
  "extends": "@snowpack/app-scripts-react",
  "plugins": [],
  "buildOptions": {
    "clean": true,
    "minify": false
  },
  "mount": {
    src: '/'
  },
  "installOptions": {
    "rollup": {
      "dedupe": ['rc-tooltip'] // work-around for @rollup/plugin-commonjs bugs
    }
  }
}
