const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const isDevelopment = process.env.NODE_ENV !== "production";

module.exports = {
  mode: isDevelopment ? "development" : "production",
  // Production 빌드 시, 리액트 코드 트랜스파일링 할 시작점 설정.
  entry: "./src/index.tsx",
  watchOptions: {
    ignored: /node_modules/,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.(js|jsx|ts|tsx)$/,
        parallel: true,
        terserOptions: {
          format: {
            comments: false, // 빌드 시, comment 제거 (주석 제거)
          },
          compress: {
            drop_console: true, // 빌드 시, console.* 구문 코드 제거
          },
        },
        extractComments: false, // 주석을 별도의 파일로 추출할 지 여부
      }),
    ],
  },

  devServer: {
    liveReload: true,
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
    hot: true,
    historyApiFallback: true,
    compress: true,
    port: 3000,
  },

  // swc 연동을 위한 swc-loader 장착.
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          allowTsInNodeModules: true,
          compilerOptions: { noEmit: false },
        },
      },
      {
        test: /\.js?/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env", "@babel/preset-react"],
          plugins: ["@babel/plugin-proposal-class-properties"],
        },
      },
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env", "@babel/preset-react"],
          plugins: ["@babel/plugin-proposal-class-properties"],
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
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
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

  // 번들링된 JS 코드를 html 파일과 매핑 및 주입시키기 위한 플러그인 설정.
  plugins: [
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
    new webpack.ProvidePlugin({ React: "react" }),
    new MiniCssExtractPlugin()
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx", ".scss", ".css"],
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].[contenthash:8].js",
    clean: true,
  },
};
