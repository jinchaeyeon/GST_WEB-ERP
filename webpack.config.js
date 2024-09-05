const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const { EsbuildPlugin } = require("esbuild-loader");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== "production";

module.exports = {
  mode: isDevelopment ? "development" : "production",
  // Production 빌드 시, 리액트 코드 트랜스파일링 할 시작점 설정.
  entry: "./src/index.tsx",

  devServer: {
    static: {
      directory: path.resolve(__dirname, "public"),
    },
    client: {
      overlay: {
        runtimeErrors: (error) => {
          if (error.message == "ResizeObserver loop limit exceeded") {
            return false;
          }
          return true;
        },
      },
    },
    historyApiFallback: true,
    compress: true,
    port: 3000,
  },

  // swc 연동을 위한 swc-loader 장착.
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx)$/i,
        loader: "esbuild-loader",
        options: {
          loader: "tsx",
          target: "es2015",
        },
      },
      {
        test: /\.ts$/, // .ts 에 한하여 ts-loader를 이용하여 transpiling
        exclude: /node_module/,
        use: {
          loader: "ts-loader",
        },
      },
      {
        test: /\.json$/,
        loader: "json-loader",
        type: "javascript/auto",
      },
      {
        test: /\.scss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // PostCSS
          {
            loader: "postcss-loader",
            options: {
              precision: 10,
              plugins: [require("autoprefixer")(), require("postcss-calc")()],
            },
          },
          // Compiles Sass to CSS
          {
            loader: "sass-loader",
            options: {
              implementation: require("node-sass"),
              // implementation: require('dart-sass'),
              sassOptions: {
                outputStyle: "compressed",
                precision: 10,
                // fiber: require('fibers')
              },
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        exclude: /\.module\.css$/i, // 모듈 파일 제외 설정
        use: ["style-loader", "css-loader"],
      },
      // CSS Module ([filename].module.css)
      {
        test: /\.module\.css$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|ttf|woff|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "static/media",
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimizer: [
      new EsbuildPlugin({
        target: "es2015", // Syntax to transpile to (see options below for possible values)
        css: true,
      }),
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: isDevelopment ? false : true, // 콘솔 로그를 제거한다
          },
        },
      }),
    ],
  },

  // 번들링된 JS 코드를 html 파일과 매핑 및 주입시키기 위한 플러그인 설정.
  plugins: [
    new ReactRefreshWebpackPlugin({
      overlay: false,
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "public/",
          globOptions: {
            ignore: ["**/index.html"],
          },
        },
      ],
    }),
    new ForkTsCheckerWebpackPlugin(),
    new webpack.ProvidePlugin({ React: "react" }),
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 3030,		
      files: ['./build/*.html'],
      server: {baseDir: ['build']} 
    })
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx", ".scss", ".css"],
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].[contenthash:8].js",
    chunkFilename: "[name].[contenthash:8].js",
    clean: true,
  },
};
