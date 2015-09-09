angular
    .module('app', [])
    .factory('AsyncService', function($q, $timeout) {

        return {
            resolveAsync: resolveAsync,
            rejectAsync: rejectAsync
        };

        function resolveAsync() {
            var deferred = $q.defer();
            $timeout(function() {
                deferred.resolve('response');
            }, 1000);
            return deferred;
        }

        function rejectAsync() {
            var deferred = $q.defer();
            $timeout(function() {
                deferred.reject('rejection');
            }, 1000);
            return deferred;
        }

    });