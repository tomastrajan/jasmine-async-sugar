
describe('Standard Jasmine (2.X) async test implemented using "done"', function() {

    var $rootScope, $timeout, AsyncService;

    beforeEach(module('app'));

    beforeEach(inject(function(_$rootScope_, _$timeout_, _AsyncService_) {

        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        AsyncService = _AsyncService_;

    }));

    it('tests async functionality of Angular JS 1.X service', function(done) {

        AsyncService.resolveAsync()
            .then(function(response) {
                expect(response).toBe('response');
                done();
            });

        $timeout.flush();
        $rootScope.$digest();
    });

});

describe('Jasmine (2.X) async test implemented using "jasmine-async-sugar"', function() {

    var AsyncService;

    beforeEach(module('app'));

    beforeEach(inject(function(_AsyncService_) {

        AsyncService = _AsyncService_;

    }));

    describe('itAsync (instead of "it"), also works with fitAsync and xitAsync', function() {

        itAsync('tests async functionality without "done", manual "$rootScope.$digest" and "$timeout.flush" triggering', function() {

            return AsyncService.resolveAsync()
                .then(function(response) {
                    expect(response).toBe('response');
                });

        });

        itAsync('tests async rejection', function() {

            return AsyncService.rejectAsync()
                .then(function(response) {
                    fail('Success callback has been called');
                })
                .catch(function(err) {
                    expect(err).toBe('rejection');
                });

        });

        itAsync('also works with "done" (so you don\'t have to remove it from already written tests)', function(done) {

            return AsyncService.resolveAsync()
                .then(function(response) {
                    expect(response).toBe('response');
                    done();
                });

        });

    });

    describe('beforeEachAsync (instead of "beforeEach"), also works with beforeAllAsync, afterEachAsync and afterAllAsync', function() {

        var result;

        beforeEachAsync(function() {
            return AsyncService.resolveAsync()
                .then(function(response) {
                    result = response;
                });
        });

        it('tests asynchronously retrieved result from "beforeEachAsync" block', function() {

            expect(result).toBe('response');

        });

    });

});
