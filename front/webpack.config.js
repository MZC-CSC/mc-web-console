const Webpack = require("webpack");
const Glob = require("glob");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const LiveReloadPlugin = require("webpack-livereload-plugin");

const configurator = {
  entries: function() {
    const entries = {
      application: ['./assets/css/application.scss'],
    };
  
    // 처리할 파일 경로의 깊이 설정
    const depths = ["./assets/*/*.*", "./assets/*/*/*.*", "./assets/*/*/*/*.*", "./assets/*/*/*/*/*.*"];
  
    // 중복 로직 제거
    depths.forEach((pattern) => {
      Glob.sync(pattern).forEach((entry) => {
        if (entry === './assets/css/application.scss') {
          return;
        }
  
        const key = entry.replace(/(\.\/assets\/(src|js|css|go)\/)|\.(ts|js|s[ac]ss|go)/g, '');
        if (key.startsWith("_") || !/(ts|js|s[ac]ss|go)$/i.test(entry)) {
          return;
        }
  
        if (!entries[key]) {
          entries[key] = [entry];
        } else {
          entries[key].push(entry);
        }
      });
    });
  
    return entries;
  },
  

  plugins() {
    var plugins = [
      new Webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery"
      }),
      new MiniCssExtractPlugin({filename: "[name].[contenthash].css"}),
      new Webpack.LoaderOptionsPlugin({minimize: true,debug: false}),
      new WebpackManifestPlugin({fileName: "manifest.json", publicPath: "/assets"}),
      new CopyWebpackPlugin({
        patterns: [
          { from: "./assets", globOptions: { ignore: [ "**/assets/css/**", "**/assets/js/**", "**/assets/src/**", ]}},
          { from: "./templates", to: "../../tmp"},
        ],
      }),
      {
        apply: (compiler) => {
          compiler.hooks.done.tap("AfterEmitPlugin", (compilation) => {
            require("child_process").exec("node render.js", (err, stdout, stderr) => {
              if (err) console.error(stderr);
              else console.log(stdout);
            });
          });
        },
      },

    ];

    return plugins
  },

  moduleOptions: function() {
    return {
      rules: [
        {
          test: /\.s[ac]ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: "css-loader", options: {sourceMap: true}},
            { loader: "postcss-loader", options: {sourceMap: true}},
            { loader: "sass-loader", options: {sourceMap: true}}
          ]
        },
        { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/},
        { test: /\.jsx?$/,loader: "babel-loader",exclude: /node_modules/ },
        { test: /\.(woff|woff2|ttf|svg)(\?v=\d+\.\d+\.\d+)?$/,use: "url-loader"},
        { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,use: "file-loader" },
      ]
    }
  },

  buildConfig: function(){
    const env = process.env.NODE_ENV || "development";

    var config = {
      mode: env,
      entry: configurator.entries(),
      output: {
        filename: "[name].[contenthash].js",
        path: `${__dirname}/public/assets`,
        clean: true,
        library:[
          'webconsolejs', "[name]"
        ]
      },
      plugins: configurator.plugins(),
      module: configurator.moduleOptions(),
      resolve: {
        extensions: ['.ts', '.js', '.json']
      },
    }

    if( env === "development" ){
      config.plugins.push(new LiveReloadPlugin({appendScriptTag: true}))
      return config
    }else {
      const terser = new TerserPlugin({
        terserOptions: {
          compress: {},
          mangle: {
            keep_fnames: true
          },
          output: {
            comments: false,
          },
        },
        extractComments: false,
      })
      config.optimization = {
        minimizer: [terser]
      }
    }

    

    return config
  }
}

module.exports = configurator.buildConfig()
