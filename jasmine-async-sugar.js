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

                return function isCalledByJasmineFunction(done) {

                    var angularContext = this;

                    if (testFunction.length) {
                        callTestFunctionWithDone();
                    } else {
                        callTestFunctionWithoutDone();
                    }

                    intervalId = setInterval(resolvePromisesAndTimeoutsAndRequests);

                    function callTestFunctionWithDone() {
                        var promise = testFunction(doneAndClearInterval);
                        if (promise && promise.catch) {
                            promise.catch(handleError);
                        }
                    }

                    function callTestFunctionWithoutDone() {
                        var promise = testFunction();
                        if (promise && promise.then) {
                            promise.then(doneAndClearInterval)
                                .catch(handleError);
                        } else {
                            throw new Error("itAsync is used without returning a promise and without done, it that's correct, use it() instead");
                        }
                    }

                    function resolvePromisesAndTimeoutsAndRequests() {
                        if (!angularContext.$injector) {
                            return handleCrashedTesting();
                        }

                        var $rootScope = angularContext.$injector.get('$rootScope');
                        var $timeout = angularContext.$injector.get('$timeout');
                        var $httpBackend = angularContext.$injector.get('$httpBackend');

                        $rootScope.$digest();
                        flushTimeout($timeout);
                        flushHttp($httpBackend);
                    }

                    function doneAndClearInterval() {
                        clearInterval(intervalId);
                        done();
                    }

                    function handleError(error) {
                        console.error(MODULE_NAME, 'unhandled rejection: ', JSON.stringify(error));
                        clearInterval(intervalId);
                    }

                    function handleCrashedTesting() {
                        console.error(MODULE_NAME, 'angular context is missing: ');
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