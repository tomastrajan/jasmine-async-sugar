
describe('Standard Jasmine (2.X) async test > ', function() {

    beforeEach(module('app'));

    it('tests async functionality of Angular JS 1.X service', function() {

        var users = ['jack', 'igor', 'jeff'];
        var sorted = users.sort();
        expect(sorted).toEqual(['igor', 'jack', 'jeff']);

    });

});
