'use strict';

(function (global, undefined) {

    var MODULE_NAME = 'jasmine-async-sugar';
    var JASMINE_FUNCTIONS = ['it', 'fit', 'xit', 'beforeEach', 'afterEach', 'beforeAll', 'afterAll'];
    var ASYNC_SUFIX = 'Async';

    global[MODULE_NAME] = registerJasmineAsyncSugarToGlobal;
    global[MODULE_NAME](global);

    function registerJasmineAsyncSugarToGlobal(global) {


        JASMINE_FUNCTIONS.forEach(function (jasmineFunctionName) {

            if (!global[jasmineFunctionName]) {
                console.error(MODULE_NAME, 'Jasmine function: ' + jasmineFunctionName + ' not present in environment');
                return;
            }
            var jasmineFunctionNameAsync = jasmineFunctionName + ASYNC_SUFIX;

            // register async methods into global context (window)
            global[jasmineFunctionNameAsync] = function () {
                var args = Array.prototype.slice.call(arguments);
                var testFunction, testDescription, timeout;
                if (args.length === 1) {
                    testFunction = args[0];
                } else if(typeof args[0] === "function"){
                    testFunction = args[0];
                    timeout = args[1];
                }else{
                    testDescription = args[0];
                    testFunction = args[1];
                    timeout = args[2];
                }
                return runAsync(global[jasmineFunctionName], testFunction, testDescription, timeout);
            };
        });


        function runAsync(jasmineFunction, testFunction, desc, timeout) {

            if (desc) {
                jasmineFunction(desc, wrapTestFunction(testFunction), timeout);
            } else {
                jasmineFunction(wrapTestFunction(testFunction), timeout);
            }

            function wrapTestFunction(testFunction) {

                var intervalId;

                return function isCalledByJasmineFunction(done) {

                    var angularContext = this;

                    //this is a guard that will prevent that done is called multiple times.
                    var finished = false;

                    doneAndClearInterval.fail = failDoneAndClearInterval;

                    if (testFunction.length) {
                        callTestFunctionWithDone();
                    } else {
                        callTestFunctionWithoutDone();
                    }

                    intervalId = setInterval(resolvePromisesAndTimeoutsAndRequests);

                    function callTestFunctionWithDone() {
                        var promise = testFunction.bind(angularContext)(doneAndClearInterval);
                        if (promise && promise.catch) {
                            promise.catch(handleError);
                        }
                    }

                    function callTestFunctionWithoutDone() {
                        var promise = testFunction.bind(angularContext)();
                        if (promise && promise.then) {
                            promise.then(doneAndClearInterval)
                                .catch(handleError);
                        } else {
                            var message = "itAsync is used without returning a promise and without done, it that's correct, use it() instead";
                            handleError(null, message);
                        }
                    }

                    function resolvePromisesAndTimeoutsAndRequests() {
                        if (finished) {
                            return;
                        }
                        if (!angularContext.$injector) {
                            return handleError(null, 'angular context is missing: ');
                        }

                        var $rootScope = angularContext.$injector.get('$rootScope');
                        var $timeout = angularContext.$injector.get('$timeout');
                        var $httpBackend = angularContext.$injector.get('$httpBackend');

                        $rootScope.$digest();
                        flushTimeout($timeout);
                        flushHttp($httpBackend);
                    }

                    function flushHttp($httpBackend) {
                        try {
                            $httpBackend.flush();
                        } catch (err) {
                            //no pending request to be flushed, that's ok with me
                            if (err.message !== 'No pending request to flush !') {
                                handleError(err);
                            }
                        }
                    }

                    function flushTimeout($timeout) {
                        if (finished) {
                            return;
                        }
                        try {
                            $timeout.flush();
                        } catch (err) {
                            //no deferred tasks to be flushed, that's ok with me
                            if (err.message !== 'No deferred tasks to be flushed') {
                                handleError(err);
                            }
                        }
                    }

                    function doneAndClearInterval() {
                        clearInterval(intervalId);
                        finished = true;
                        done();
                    }

                    function failDoneAndClearInterval(msg){
                        clearInterval(intervalId);
                        finished = true;
                        done.fail(msg);
                    }

                    function handleError(error, message) {
                        message = message || 'unhandled rejection: ';
                        if (error && error.message) {
                            message = message + JSON.stringify(error.message);
                        } else if (error) {
                            message = message + JSON.stringify(error);
                        }
                        clearInterval(intervalId);
                        finished = true;
                        done.fail(message);
                        if (error) {
                            throw error;
                        }
                    }

                };
            }
        }


    }

})(window);