# jasmine-async-sugar

Drop-in syntax sugar for Jasmine 2.X test framework to enhance testing of async (promise) functionality to be used with Angular 1.X

## How to use it?

1. `bower install jasmine-async-sugar`
2. add reference to `files` in `karma.conf.js` or in karma task of `grunt` (`gulp`, other build system)
3. adjust your tests

### Example karma.conf.js 
```
module.exports = function(config) {
    config.set({

        // ...
        files: [
          // standard angular testing setup
          'bower_components/angular/angular.js',
          'bower_components/angular-mocks/angular-mocks.js',
        
          // our drop in library file
          'bower_components//jasmine-async-sugarjasmine-async-sugar.js',
        
          // test app and spec files
          'test/**/*.js',
          'test/**/*.spec.js'
        ]
        // ...
    });
};
``` 


