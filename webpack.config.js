const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const isDevelopment = process.env.NODE_ENV !== "production";

module.exports = {
  mode: "development",
  // Production 빌드 시, 리액트 코드 트랜스파일링 할 시작점 설정.
  entry: "./src/index.tsx",

  // webpack Develop 모드 실행 시, 사용될 static 파일들 경로와 관리 방식 설정.
  devServer: {
    // static: {
    //   directory: path.resolve(__dirname, "public"),
    // },
    client: {
      overlay: {
        runtimeErrors: (error) => {
          if (error.message === "ResizeObserver loop limit exceeded") {
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
          presets: [
            "@babel/preset-env",
            ["@babel/preset-react", { runtime: "automatic" }],
          ],
          plugins: [
            "@babel/plugin-proposal-class-properties",
            isDevelopment && require.resolve("react-refresh/babel"),
          ].filter(Boolean),
        },
      },
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        options: {
          presets: [
            "@babel/preset-env",
            ["@babel/preset-react", { runtime: "automatic" }],
          ],
          plugins: [
            "@babel/plugin-proposal-class-properties",
            isDevelopment && require.resolve("react-refresh/babel"),
          ].filter(Boolean),
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
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|jpeg)$/,
        use: ["file-loader"],
      },
    ],
  },

  // 번들링된 JS 코드를 html 파일과 매핑 및 주입시키기 위한 플러그인 설정.
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "/public/index.html"),
      inject: true,
    }),
    new webpack.DefinePlugin({ process: { env: {} } }),
    isDevelopment && new webpack.HotModuleReplacementPlugin(),
    isDevelopment && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),

  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx", ".scss", ".css"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "public"),
  },
};
