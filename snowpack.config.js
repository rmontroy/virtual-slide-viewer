/* eslint-disable no-undef */
module.exports = {
  "plugins": [
    '@snowpack/plugin-react-refresh', '@snowpack/plugin-babel', '@snowpack/plugin-dotenv',
    ["@snowpack/plugin-run-script", {
      "cmd": "eslint src --ext .js,jsx,.ts,.tsx",
      // Optional: Use npm package "watch" to run on every file change
      "watch": "watch \"$1\" src"
    }],
    ["@snowpack/plugin-optimize", { }]
  ],
  "buildOptions": {
    "clean": true,
    "minify": false
  },
  "mount": {
    'src/ImageView': '/viewer',
    'src/DataView': '/',
  },
  "installOptions": {
    "sourceMap": true
  }
}
