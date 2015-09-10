module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            // standard angular testing setup
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',

            // our drop in library file
            'jasmine-async-sugar.js',

            // test app and spec files
            'test/**/*.js',
            'test/**/*.spec.js'
        ],
        exclude: [
        ],
        preprocessors: {},
        reporters: ['mocha'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['Chrome'],
        singleRun: true
    });
};