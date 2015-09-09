(function(global) {

    var JASMINE_FUNCTIONS = ['it', 'fit', 'xit', 'beforeEach', 'afterEach', 'beforeAll', 'afterAll'];
    var ASYNC_SUFIX = 'Async';

    JASMINE_FUNCTIONS.forEach(function(jasmineFunctionName) {
        if (!global[jasmineFunctionName]) {
            console.error('jasmine-async-sugar - Jasmine function: ' + jasmineFunctionName + ' not present in environment');
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
                    testFunction(doneAndClearInterval);
                } else {
                    testFunction()
                        .then(doneAndClearInterval)
                        .catch(function (err) {
                            console.log(err);
                        });
                }
                intervalId = setInterval(function () {
                    this.$injector.get('$rootScope').$digest();
                }.bind(this));

                function doneAndClearInterval() {
                    clearInterval(intervalId);
                    done();
                }
            }
        }

    }

})(window);