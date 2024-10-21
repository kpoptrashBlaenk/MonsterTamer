const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './src/main.ts', // Entry point
  output: {
    filename: 'bundle.min.js', // Output file
    path: path.resolve(__dirname, 'dist'), // Output folder
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'), // Serve public folder
    },
    compress: true,
    port: 9000, // Localhost port
  },
  resolve: {
    extensions: ['.ts', '.js'],
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
        { from: 'public/index.html', to: 'index.html' },
        { from: 'public/assets', to: 'assets' }, // Copy index.html to dist
      ],
    }),
  ],
}
