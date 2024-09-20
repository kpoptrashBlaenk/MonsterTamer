const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development', // Change to 'production' for production builds
  entry: './src/main.ts', // Entry point is now in the public folder
  output: {
    filename: 'bundle.min.js', // Output file will be bundle.min.js
    path: path.resolve(__dirname, 'dist'), // Output will go into the dist folder
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'), // Serve the public folder
    },
    compress: true,
    port: 9000, // Localhost port for development
  },
  resolve: {
    extensions: ['.ts', '.js'], // Resolve .ts and .js files
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // Use ts-loader for all .ts files
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public/index.html', to: 'index.html' },  // Copy index.html to dist
      ],
    }),
  ],
};