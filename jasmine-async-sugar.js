(function (global, undefined) {
    'use strict';

    var MODULE_NAME = 'jasmine-async-sugar';
    var JASMINE_FUNCTIONS = ['it', 'fit', 'xit', 'beforeEach', 'afterEach', 'beforeAll', 'afterAll'];
    var ASYNC_SUFIX = 'Async';

    global[MODULE_NAME] = registerJasmineAsyncSugarToGlobal;
    global[MODULE_NAME](global);

    function registerJasmineAsyncSugarToGlobal(global) {


        JASMINE_FUNCTIONS.forEach(function (jasmineFunctionName) {

            if (!global[jasmineFunctionName]) {
                window.console.error(MODULE_NAME, 'Jasmine function: ' + jasmineFunctionName + ' not present in environment');
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
                            handleError(message);
                        }
                    }

                    function resolvePromisesAndTimeoutsAndRequests() {
                        if (finished) {
                            return;
                        }
                        if (!angularContext.$injector) {
                            //psst, jasmine will do the rest.
                            clearInterval(intervalId);
                            finished = true;
                            return;
                        }

                        var $rootScope = angularContext.$injector.get('$rootScope');
                        var $timeout = angularContext.$injector.get('$timeout');
                        var $httpBackend = angularContext.$injector.get('$httpBackend');

                        try {
                            $rootScope.$digest();
                        }catch(e){
                            //The thrown error will leave angular thinking
                            //it still is digesting, here we stop it from doing so.
                            $rootScope.$$phase = null;
                        }
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
                        setTimeout(done); // The setTimeout makes sure the next beforeEach(Async), itAsync, etc.
                                          // will run OUTSIDE of a $digest phase. This is important when mimicking
                                          // a user clicking on elements in follow-up steps, because a ng-click event
                                          // handler triggers a $digest() which is not possible if we're alredy in a $digest phase.
                    }

                    function failDoneAndClearInterval(msg){
                        clearInterval(intervalId);
                        finished = true;

                        // The setTimeout makes sure the next beforeEach(Async), it(Async), etc.
                        // will run OUTSIDE of a $digest phase. This is important when mimicking
                        // a user clicking on elements in follow-up steps, because a ng-click event
                        // handler triggers a $digest() which is not possible if we're alredy in a $digest phase.
                        setTimeout(function() {
                            done.fail(msg);
                        });
                    }

                    function handleError(error) {
                        var message;
                        if(error instanceof Error){
                            message = error.stack;
                        }else if(typeof error === 'string' || typeof error === 'number'){
                            message = error;
                        }else {
                            try {
                                message = JSON.stringify(error);
                            }catch(err){
                                message = error;
                            }
                        }
                        clearInterval(intervalId);
                        finished = true;
                        done.fail(message);
                    }

                };
            }
        }


    }

})(window);