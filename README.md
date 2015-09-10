# Jasmine async sugar (jasmine-async-sugar)

Drop-in syntax sugar for Jasmine 2.X test framework to enhance testing of async (promise) functionality to be used with Angular 1.X. Library adds extra global methods which handle async tests implicitly without need to call `$rootScope.$digest();`, `$timeout.flush();` or `done()`.

## Standard Jasmine 2.X test vs jasmine-async-sugar

```javascript
// standard test
    
// ... initialize angular module, inject $rootScope, $timeout and service

it('tests async functionality of Angular JS 1.X service', function(done) {

    AsyncService.resolveAsync()
        .then(function(response) {
            expect(response).toBe('response');
            done();
        });

    $timeout.flush();
    $rootScope.$digest();
});

    // vs
    
// jasmine-async-sugar

```

## Supported methods
* `itAsync` -> `it`
* `itAsync` -> `it`
* `itAsync` -> `it`
* `itAsync` -> `it`
* `itAsync` -> `it`
* `itAsync` -> `it`
* `itAsync` -> `it`


## How to use it?

1. `bower install jasmine-async-sugar`
2. add reference to `files` in `karma.conf.js` or in karma task of `grunt` (`gulp` or other build system...)
3. adjust your tests

### Example karma.conf.js 
```javascript
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


