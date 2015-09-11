(function(global, undefined) {

    var MODULE_NAME = 'jasmine-async-sugar';
    var JASMINE_FUNCTIONS = ['it', 'fit', 'xit', 'beforeEach', 'afterEach', 'beforeAll', 'afterAll'];
    var ASYNC_SUFIX = 'Async';

    JASMINE_FUNCTIONS.forEach(function(jasmineFunctionName) {

        if (!global[jasmineFunctionName]) {
            console.error(MODULE_NAME, 'Jasmine function: ' + jasmineFunctionName + ' not present in environment');
            return;
        }
        var jasmineFunctionNameAsync = jasmineFunctionName + ASYNC_SUFIX;

        // register async methods into global context (window)
        global[jasmineFunctionNameAsync] = function() {
            var args = Array.prototype.slice.call(arguments);
            var testFunction, testDescription;
            if (args.length === 1) {
                testFunction = args[0]
            } else {
                testDescription = args[0];
                testFunction = args[1];
            }
            return runAsync(global[jasmineFunctionName], testFunction, testDescription);
        }
    });

    function runAsync(jasmineFunction, testFunction, desc) {

        if (desc){
            jasmineFunction(desc, wrapTestFunction(testFunction));
        } else {
            jasmineFunction(wrapTestFunction(testFunction));
        }

        function wrapTestFunction(testFunction) {

            var intervalId;

            return function(done) {
                if (testFunction.length) {
                    // function uses "done" as parameter so it will be called in function
                    testFunction(doneAndClearInterval)
                        .catch(handleError);
                } else {
                    // function doesn't use "done" as parameter so call it explicitly here
                    testFunction()
                        .then(doneAndClearInterval)
                        .catch(handleError);
                }

                intervalId = setInterval(function () {
                    this.$injector.get('$rootScope').$digest();
                    this.$injector.get('$timeout').flush();
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

})(window);