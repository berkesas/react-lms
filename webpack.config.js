var path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'src/components') // path to the subfolder you want to include
        ],
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        // loader: ["style-loader","css-loader"],
        // loader:"style-loader!css-loader"
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  externals: {
    react: "react"
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  }
};