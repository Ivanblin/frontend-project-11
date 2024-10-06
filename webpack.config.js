// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

const isProduction = process.env.NODE_ENV == 'production';


const config = {
    entry: './src/index.js',
    // output: {
    //     path: path.resolve(__dirname, 'dist'),
    // },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        open: true,
        host: 'localhost',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html',
        }),

        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    ],
    // module: {
    //     rules: [
    //         {
    //             test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
    //             type: 'asset',
    //         },

    //         // Add your rules for custom modules here
    //         // Learn more about loaders from https://webpack.js.org/loaders/
    //     ],
    // },
    module: {
      rules: [
          {
              test: /\.css$/, // Обрабатываем файлы с расширением .css
              use: ['style-loader', 'css-loader'], // Используем style-loader и css-loader
          },
      ],
  },

};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
        
        
        config.plugins.push(new WorkboxWebpackPlugin.GenerateSW());
        
    } else {
        config.mode = 'development';
    }
    return config;
};
