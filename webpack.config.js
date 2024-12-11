const Webpack = require("webpack");
const Glob = require("glob");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");

const configurator = {
  entries: function(){
    var entries = {
      application: [
        './assets/css/application.scss',
        './assets/js/application.js',
      ],
    }

    Glob.sync(path.resolve(__dirname, "assets/**/*.{js,scss,css}")).forEach((entry) => {
        if (
            entry === path.resolve(__dirname, "assets/css/application.scss") ||
            entry === path.resolve(__dirname, "assets/js/application.js")
        ) {
            return;
        }

        const key = entry.replace(path.resolve(__dirname, "assets"), "").replace(/(\.(ts|js|s[ac]ss|go))$/g, "").replace(/^\//, ""); // 앞쪽 '/' 제거;
        console.log(key)
        if (key.startsWith("_") || !/(ts|js|s[ac]ss|go)$/i.test(entry)) {
            return;
        }

        if (!entries[key]) {
            entries[key] = [entry];
        } else {
            entries[key].push(entry);
        }
    });
    
    
    return entries
  },

  plugins() {
    var plugins = [
      new Webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery"
      }),
      new MiniCssExtractPlugin({filename: "[name].[contenthash].css"}),
      new CopyWebpackPlugin({
        patterns: [{
          from: "./assets",
          globOptions: {
            ignore: [
                "**/*.js", 
                "**/*.css",
                "**/*.scss",
            ]
          }
        }],
      }),
      new Webpack.LoaderOptionsPlugin({minimize: true,debug: false}),
      new WebpackManifestPlugin({fileName: "manifest.json", publicPath: "/public"})
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
            { loader: "sass-loader", options: {sourceMap: true}},
          ]
        },
        { test: /\.jsx?$/,loader: "babel-loader",exclude: /node_modules/ },
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
        path: `${__dirname}/public/`,
        clean: true,
        library:[
          'webconsolejs', "[name]"
        ]
      },
      plugins: configurator.plugins(),
      module: configurator.moduleOptions(),
      resolve: {
        extensions: ['.ts', '.js', '.json'],
        preferRelative: true,
      },
    }

    if( env === "development" ){
      return config
    }

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

    return config
  }
}

module.exports = configurator.buildConfig()
