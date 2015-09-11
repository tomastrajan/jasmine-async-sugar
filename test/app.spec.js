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

    var AsyncService, $httpBackend;

    beforeEach(module('app'));

    beforeEach(inject(function (_AsyncService_, _$httpBackend_) {

        AsyncService = _AsyncService_;
        $httpBackend = _$httpBackend_;

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

});
