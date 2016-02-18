/**
 * Created by root on 16-1-21.
 */

var assert=require("assert");
var cityCtl = require("../controller/city_controller.js");

describe('Array', function() {
    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            assert.equal(-1, [1,2,3].indexOf(5));
            assert.equal(-1, [1,2,3].indexOf(0));
        });
    });
});

describe('city has return value', function() {
        it('should return -1 when the value is not present', function () {
            assert.equal(-1, [1,2,3].indexOf(5));
            assert.equal(-1, [1,2,3].indexOf(0));
        });
});

describe('generator should bave the correct value',function(){
    it('should generate works in 4.5',function(){
        function* idMaker(){
            var index = 0;
            while(index < 3)
                yield index++;
        }

        var gen = idMaker();

        console.log('for new test');

        console.log(gen.next().value); // 0
        console.log(gen.next().value); // 1
        console.log(gen.next().value); // 2
        console.log(gen.next().value); // undefined
    })
})
