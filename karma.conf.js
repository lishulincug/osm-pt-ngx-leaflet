// Karma configuration
// Generated on Sat Jun 03 2017 11:44:54 GMT+0200 (CEST)

var path = require("path");
var webpackConfig = require("./webpack/webpack.config.dev");
var entry = path.resolve(webpackConfig.context); // , webpackConfig.entry
// var preprocessors = {};
// preprocessors[entry] = ["webpack"];

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: "./",
        /*
         * frameworks to use
         * available frameworks: https://npmjs.org/browse/keyword/karma-adapter
         */
        frameworks: ["jasmine"],

        // Karma automatically includes all karma-* plugins
        // plugins: [
        //     "karma-coverage",
        //     "karma-requirejs",
        //     "karma-jasmine",
        //     "karma-chrome-launcher",
        //     "karma-firefox-launcher",
        //     "karma-webpack"
        // ],

        // list of files / patterns to load in the browser
        files: [
            // entry,
            "test/main.js",
            "node_modules/@types/leaflet/index.d.ts",
        ],
        // "test/main.spec.ts",
        // "test/overpass.service.spec.ts",
        // "node_modules/leaflet/src/Leaflet.js"
        // "node_modules/@types/leaflet/index.d.ts",
        // {pattern: "node_modules/**/*.js"},
        // {pattern: "node_modules/@types/**/*.ts"}

        // list of files to exclude
        exclude: [ ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            "test/main.js": ["webpack", "sourcemap"],
            "public_src/**/*.ts": ["webpack", "sourcemap"],
            "node_modules/@types/leaflet/index.d.ts": ["webpack", "sourcemap"],
            "node_modules/leaflet/src/Leaflet.js": ["webpack", "sourcemap"]
        },
        // "test/*.spec.ts": ["webpack", "sourcemap"],

        // test results reporter to use
        // possible values: "dots", "progress"
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ["progress", "coverage"],

        // ({env: "test"})
        webpack: webpackConfig,

        webpackMiddleware: {
            // webpack-dev-middleware configuration
            // i. e.
            stats: "errors-only"
        },

        // optionally, configure the reporter
        coverageReporter: {
            dir: "coverage/",
            reporters: [
                {type: "html"},
                {type: "text-summary"},
                {type: "json"}
            ]
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG

        logLevel: config.LOG_DEBUG,
        // enable / kdisable watching file and executing tests whenever any file changes

        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ["PhantomJS"], // "Chrome", "PhantomJS", "Firefox", "Safari"

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    });
};
