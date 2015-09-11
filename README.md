# jasmine-async-sugar

Simple drop-in syntax sugar for `Jasmine 2.X` test framework to enhance testing of async (promise) functionality in `Angular 1.X` applications.

Library adds extra global methods which handle async tests implicitly without need to call `$rootScope.$digest();`, `$timeout.flush();`,`$httpBackend.flush();`,  or `done();` manually. Only thing you need to do is to **return the promise in your test function**. This approach was **inspired by `Mocha`** test framework which waits for resolution of returned promises by default before progressing to next test block.

## Standard Jasmine 2.X test vs jasmine-async-sugar

```javascript
// standard test
    
// ... initialize angular module, inject $rootScope, $timeout, $httpBackend and service

it('tests async functionality in standard way', function(done) {

    AsyncService.resolveAsync()
        .then(function(response) {
            expect(response).toBe('response');
            
            // call done() explicitly
            done();
        });

    // we use $timeout in service, which is mocked because we included angular-mocks so we have to trigger manually
    $timeout.flush();
    
    // we have to call $rootScope.$digest() to process pending promises in angular context
    $rootScope.$digest();
    
    // we have to call $httpBackend.flush to process pending requests
    $httpBackend.flush()
    
    //Be aware, that the upper three functions must be callen in the correct order, 
    //depending on the implementation of the code under test
});

    // vs
    
// jasmine-async-sugar

itAsync('tests async functionality without "done", manual "$rootScope.$digest" and "$timeout.flush" triggering', function() {

    // only thing we need to do is return promise 
    // $rootScope.$digest(), $timeout.flush() and done() are handled automatically by library
    return AsyncService.resolveAsync()
        .then(function(response) {
            expect(response).toBe('response');
        });

});

```

## Supported methods
* `itAsync`
* `fitAsync`
* `xitAsync`
* `beforeEachAsync`
* `beforeAllAsync`
* `afterEachAsync`
* `afterAllAsync`

## How to use it?

1. `bower install jasmine-async-sugar --save-dev` or `bower i jasmine-async-sugar -D`
2. add `jasmine-async-sugar.js` reference to `files` array in `karma.conf.js` or in karma task of `grunt` (`gulp` or other build system...)
3. adjust your tests to use async methods

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
          'bower_components/jasmine-async-sugar/jasmine-async-sugar.js',
        
          // test app and spec files
          'test/**/*.js',
          'test/**/*.spec.js'
        ]
        // ...
    });
};
``` 

### Example of tests using async methods
Check example [application](https://github.com/tomastrajan/jasmine-async-sugar/blob/master/test/app.js) and corresponding [tests](https://github.com/tomastrajan/jasmine-async-sugar/blob/master/test/app.spec.js).

### Motivation
Library was created because we encountered problem using standard `$rootScope.$digest();` at the end of the test in one particular situation where we were chaining Angular's `$q` and Node's `q` promises together. In that case one call to `$rootScope.$digest();` isn't enough even if all `q` promises are properly wrapped with `$q.when(qPromise);`. Library internaly uses `setInterval`, which will call `$rootScope.$digest();` until all chained promises are resolved and `done();` called. At the end the inteval is cleared.

# Contributing

Please, feel free to submit bugs (prefferably with pull requests) or new features.

## How to run tests?

1. clone repository `git clone https://github.com/tomastrajan/jasmine-async-sugar.git`
2. install dependencies by running `npm install` and `bower install`
3. run tests by running `npm test`


