const Webpack = require("webpack");
const Glob = require("glob");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const LiveReloadPlugin = require("webpack-livereload-plugin");

const configurator = {
  entries: function(){
    var entries = {
      application: [
        './assets/css/application.scss',
      ],
    }

    const levels = [3, 4, 5];
    const patterns = levels.map(level => `./assets/${"*/".repeat(level - 1)}*.*`);

    var entries = {};
    patterns.forEach(pattern => {
      Glob.sync(pattern).forEach(entry => {
        if (entry === './assets/css/application.scss') return;
        if (!/(ts|js|s[ac]ss|go)$/i.test(entry)) return;
    
        const key = entry.replace(/(\.\/assets\/(src|js|css|go)\/)|\.(ts|js|s[ac]ss|go)/g, '');
        if (key.startsWith("_")) return;
    
        entries[key] = entries[key] || [];
        entries[key].push(entry);
      });
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
      new Webpack.LoaderOptionsPlugin({minimize: true,debug: false}),
      // new WebpackManifestPlugin({fileName: "manifest.json",publicPath: "../manifest.json"})
      new WebpackManifestPlugin({fileName: "manifest.json",publicPath: ""}),
      new CopyWebpackPlugin({
        patterns: [
          { from: "./assets", globOptions: { ignore: [ "**/assets/css/**", "**/assets/js/**", "**/assets/src/**", ]}},
          { from: "./templates", to: "./dist/templates" },
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
        { test: /\.go$/, use: "gopherjs-loader"}
      ]
    }
  },

  buildConfig: function(){
    // NOTE: If you are having issues with this not being set "properly", make
    // sure your GO_ENV is set properly as `buffalo build` overrides NODE_ENV
    // with whatever GO_ENV is set to or "development".
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
