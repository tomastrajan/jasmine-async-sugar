'use strict';

(function (global, undefined) {

    var MODULE_NAME = 'jasmine-async-sugar';
    var JASMINE_FUNCTIONS = ['it', 'fit', 'xit', 'beforeEach', 'afterEach', 'beforeAll', 'afterAll'];
    var ASYNC_SUFIX = 'Async';

    global[MODULE_NAME] = function (global) {


        JASMINE_FUNCTIONS.forEach(function (jasmineFunctionName) {

            if (!global[jasmineFunctionName]) {
                console.error(MODULE_NAME, 'Jasmine function: ' + jasmineFunctionName + ' not present in environment');
                return;
            }
            var jasmineFunctionNameAsync = jasmineFunctionName + ASYNC_SUFIX;

            // register async methods into global context (window)
            global[jasmineFunctionNameAsync] = function () {
                var args = Array.prototype.slice.call(arguments);
                var testFunction, testDescription;
                if (args.length === 1) {
                    testFunction = args[0];
                } else {
                    testDescription = args[0];
                    testFunction = args[1];
                }
                return runAsync(global[jasmineFunctionName], testFunction, testDescription);
            };
        });


        function runAsync(jasmineFunction, testFunction, desc) {

            if (desc) {
                jasmineFunction(desc, wrapTestFunction(testFunction));
            } else {
                jasmineFunction(wrapTestFunction(testFunction));
            }

            function wrapTestFunction(testFunction) {

                var intervalId;

                return function (done) {
                    if (testFunction.length) {
                        // function uses "done" as parameter so it will be called in function
                        testFunction(doneAndClearInterval)
                            .catch(handleError);
                    } else {
                        // function doesn't use "done" as parameter so call it explicitly here
                        var promise = testFunction();
                        if (promise && promise.then) {
                            promise.then(doneAndClearInterval)
                                .catch(handleError);
                        }else{
                            throw new Error("itAsync is used without returning a promise and without done, it that's correct, use it() instead");
                        }
                    }

                    function handleCrashedTesting() {
                        console.error(MODULE_NAME, 'angular context is missing: ');
                        clearInterval(intervalId);
                    }

                    intervalId = setInterval(function () {
                        if (!this.$injector) {
                            return handleCrashedTesting();
                        }

                        var $rootScope = this.$injector.get('$rootScope');
                        var $timeout = this.$injector.get('$timeout');
                        var $httpBackend = this.$injector.get('$httpBackend');

                        $rootScope.$digest();
                        flushTimeout($timeout);
                        flushHttp($httpBackend);

                    }.bind(this));

                    function doneAndClearInterval() {
                        clearInterval(intervalId);
                        done();
                    }

                    function handleError(error) {
                        console.error(MODULE_NAME, 'unhandled rejection: ', JSON.stringify(error));
                        clearInterval(intervalId);
                    }

                };

            }

        }

        function flushHttp($httpBackend) {
            try {
                $httpBackend.flush();
            } catch (err) {
                //no pending request to be flushed, thats ok with me
                if (err.message !== 'No pending request to flush !') {
                    throw err;
                }
            }
        }

        function flushTimeout($timeout) {
            try {
                $timeout.flush();
            } catch (err) {
                //no deferred tasks to be flushed, thats ok with me
                if (err.message !== 'No deferred tasks to be flushed') {
                    throw err;
                }
            }
        }
    };
    global[MODULE_NAME](global);
})(window);