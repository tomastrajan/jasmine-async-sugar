/* jshint jasmine: true */
/*globals inject, itAsync, beforeEachAsync*/
'use strict';

describe('Standard Jasmine (2.X) async test implemented using "done"', function () {

    var $rootScope, $timeout, AsyncService, $httpBackend;

    beforeEach(module('app'));

    beforeEach(inject(function (_$rootScope_, _$timeout_, _AsyncService_, _$httpBackend_) {

        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        AsyncService = _AsyncService_;
        $httpBackend = _$httpBackend_;

    }));

    it('tests async functionality of Angular JS 1.X service', function (done) {

        AsyncService.resolveAsync()
            .then(function (response) {
                expect(response).toBe('response');
                done();
            });

        $timeout.flush();
        $rootScope.$digest();
    });


    it('tests async + http functionality of Angular JS 1.X service', function (done) {

        $httpBackend.expectGET(/.*google.com/).respond(function (m, url, data, headers) {
            return [200, 'response', headers];
        });
        AsyncService.resolveAfterHttpCall()
            .then(function (response) {
                expect(response).toBe('response');
                done();
            });

        //here, order matters, it depends on the implementation of resolveAfterHttpCall
        $httpBackend.flush();
        $timeout.flush();
        $rootScope.$digest();
    });
});

describe('Jasmine (2.X) async test implemented using "jasmine-async-sugar"', function () {

    var $rootScope, AsyncService, $httpBackend, $window, $q;

    beforeEach(module('app'));

    beforeEach(inject(function (_$rootScope_, _AsyncService_, _$httpBackend_, _$window_, _$q_) {
        $rootScope = _$rootScope_;
        AsyncService = _AsyncService_;
        $httpBackend = _$httpBackend_;
        $window = _$window_;
        $q = _$q_;

    }));

    describe('itAsync (instead of "it"), also works with fitAsync and xitAsync', function () {

        itAsync('tests async functionality without "done", manual "$rootScope.$digest" and "$timeout.flush" triggering', function () {

            return AsyncService.resolveAsync()
                .then(function (response) {
                    expect(response).toBe('response');
                });

        });

        itAsync('tests async rejection', function () {

            return AsyncService.rejectAsync()
                .then(function () {
                    fail('Success callback has been called');
                })
                .catch(function (err) {
                    expect(err).toBe('rejection');
                });

        });

        itAsync('also works with "done" (so you don\'t have to remove it from already written tests)', function (done) {

            return AsyncService.resolveAsync()
                .then(function (response) {
                    expect(response).toBe('response');
                    done();
                });

        });

        itAsync('tests async + http functionality', function () {

            $httpBackend.expectGET(/.*google.com/).respond(function (m, url, data, headers) {
                return [200, 'response', headers];
            });

            return AsyncService.resolveAfterHttpCall()
                .then(function (response) {
                    expect(response).toBe('response');
                });
        });

        itAsync('itAsync must have the same "this" as a normal it', function (done) {
            expect(this.$injector).toBeDefined();
            done();
        });

        itAsync('itAsync must provide done.fail to fail a test', function (done) {
            expect(done.fail).toBeDefined();
            done();
        });

        it('itAsync will accept the timeout as last parameter an pass it to the jasmine function', function () {
            var globalWithJasmineMock = {
                it: function (desc, fn, timeout) {
                    expect(timeout).toBe(10000);
                }
                    .bind(this)// provides this.$injector
            };
            spyOn(console, 'error');
            $window['jasmine-async-sugar'](globalWithJasmineMock);

            globalWithJasmineMock.itAsync('thisTestMustNotFail', function (done) {
                done();
            }, 10000);
        });
    });

    describe('error handling', function () {
        it('itAsync must provide done.fail to fail a test', function (done) {
            var globalWithJasmineMock = {
                it: function (desc, fn) {
                    fn = fn.bind(this); // provides this.$injector
                    var innerDone = function(){
                        done.fail('test should have failed');
                    };
                    innerDone.fail = function(message){
                        expect(message).toBe("test failed correctly");
                        done();
                    };
                    fn(innerDone);
                }
                    .bind(this)// provides this.$injector
            };

            spyOn(console, 'error');
            $window['jasmine-async-sugar'](globalWithJasmineMock);

            globalWithJasmineMock.itAsync('this test will fail with done.fail', function (done) {
                done.fail("test failed correctly");
            });
        });

        it('itAsync without done or returning promise will throw useful error', function (done) {
            var globalWithJasmineMock = {
                it: function (desc, fn) {
                    fn = fn.bind(this); // provides this.$injector
                    var innerDone = function(){
                        done.fail('test should have failed');
                    };
                    innerDone.fail = function(message){
                        expect(message).toBe("itAsync is used without returning a promise and without done, it that's correct, use it() instead");
                        done();
                    };
                    fn(innerDone);
                }
                    .bind(this)// provides this.$injector
            };

            spyOn(console, 'error');
            $window['jasmine-async-sugar'](globalWithJasmineMock);

            globalWithJasmineMock.itAsync('thisTestMustFailGracefully', function () {
                expect(3).toBe(3);
            });
        });

        it('itAsync with done must work normally without returning a promise', function (done) {
            var globalWithJasmineMock = {
                it: function (desc, fn) {
                    fn = fn.bind(this); // provides this.$injector
                    fn(done);
                }
                    .bind(this)// provides this.$injector
            };

            spyOn(console, 'error');
            $window['jasmine-async-sugar'](globalWithJasmineMock);

            $httpBackend.expectGET(/.*google.com/).respond(function (m, url, data, headers) {
                return [200, 'response', headers];
            });
            globalWithJasmineMock.itAsync('thisTestMustNotFail', function (done) {
                AsyncService.resolveAfterHttpCall()
                    .then(function (response) {
                        expect(response).toBe('response');
                        done();
                    });
            });
        });

        it('itAsync returning a promise, which is rejected with a string must report correctly', function (done) {
            var globalWithJasmineMock = {
                it: function (desc, fn) {

                    var innerDone = function(){
                        done.fail('test should have failed');
                    };
                    innerDone.fail = function(message){
                        expect(message).toBe('a special reason');
                        done();
                    };

                    fn.bind(this)(innerDone);
                }.bind(this)// provides this.$injector
            };
            spyOn(console, 'error');
            $window['jasmine-async-sugar'](globalWithJasmineMock);

            globalWithJasmineMock.itAsync('thisTestMustFail', function () {
                return $q(function(resolve, reject){
                    reject('a special reason');
                });
            });
        });

        it('itAsync returning a promise, which is rejected with an object must report correctly', function (done) {
            var globalWithJasmineMock = {
                it: function (desc, fn) {

                    var innerDone = function(){
                        done.fail('test should have failed');
                    };
                    innerDone.fail = function(message){
                        expect(message).toContain('specialKey');
                        done();
                    };

                    fn.bind(this)(innerDone);
                }.bind(this)// provides this.$injector
            };
            spyOn(console, 'error');
            $window['jasmine-async-sugar'](globalWithJasmineMock);

            globalWithJasmineMock.itAsync('thisTestMustFail', function () {
                return $q(function(resolve, reject){
                    var obj = {
                        specialKey: 'value'
                    };
                    reject(obj);
                });
            });
        });


        it('itAsync returning a promise, which is rejected with an Error must report correctly', function (done) {
            var globalWithJasmineMock = {
                it: function (desc, fn) {

                    var innerDone = function(){
                        done.fail('test should have failed');
                    };
                    innerDone.fail = function(message){
                        expect(message).toContain('a special reason');
                        expect(message).toContain('specialThrowingFunction');
                        done();
                    };

                    fn.bind(this)(innerDone);
                }.bind(this)// provides this.$injector
            };
            spyOn(console, 'error');
            $window['jasmine-async-sugar'](globalWithJasmineMock);

            globalWithJasmineMock.itAsync('thisTestMustFail', function () {
                return $q(function(resolve, reject){
                    resolve();
                }).then(function(){
                    specialThrowingFunction();
                });
                function specialThrowingFunction(){
                    throw new Error('a special reason');
                }
            });
        });
    });

    describe('beforeEachAsync (instead of "beforeEach"), also works with beforeAllAsync, afterEachAsync and afterAllAsync', function () {

        var result;

        beforeEachAsync(function () {
            return AsyncService.resolveAsync()
                .then(function (response) {
                    result = response;
                });
        });

        it('tests asynchronously retrieved result from "beforeEachAsync" block', function () {

            expect(result).toBe('response');

        });

    });

    describe("code-blocks should always run in separate $digest cycles", function () {
        var result;

        beforeEach(function() {
            $rootScope.$digest = $rootScope.$digest.bind($rootScope);
        });

        beforeEachAsync(function () {
            // clicking somewhere might induce a $digest run (because in tests one usually simulates the click
            // event synchronously:
            expect($rootScope.$digest).not.toThrow();

            return AsyncService.resolveAsync()
                .then(function (response) {
                    result = 1;
                });
        });

        beforeEachAsync(function() {
            expect(result).toBe(1);

            // clicking somewhere might induce a $digest run (because in tests one usually simulates the click
            // event synchronously:
            expect($rootScope.$digest).not.toThrow();

            return AsyncService.resolveAsync()
                .then(function (response) {
                    result = 2;
                });

        });

        it('tests asynchronously retrieved result from "beforeEachAsync" block', function () {
            expect($rootScope.$digest).not.toThrow();

            expect(result).toBe(2);

        });

    })

});
