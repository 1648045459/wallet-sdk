var crypto = require('crypto'),
Seq    = require('sequin');
describe('utils:功能测试', function () {
  describe('utils.createWallet',async  function () {
    try {
        var DEFAULT_BITS  = 128,
        DEFAULT_RADIX = 16,
        DIGITS        = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');


        var rand = function(bits, radix) {
          bits  = bits  || DEFAULT_BITS;
          radix = radix || DEFAULT_RADIX;

          if (radix < 2 || radix > 36)
          throw new Error('radix argument must be between 2 and 36');

          var length  = Math.ceil(bits * Math.log(2) / Math.log(radix)),
          entropy = crypto.randomBytes(bits),
          stream  = new Seq(entropy),
          string  = '';
          // console.log("entropy = ", entropy)
          // console.log("length = ", length)
          // console.log("stream = ", stream)
          // console.log("radix = ", radix)
          // console.log("stream.generate(radix) = ", stream.generate(radix))


          while (string.length < length)
          string += DIGITS[stream.generate(radix)];

          return string;
        };
        for (let index = 0; index <= 5000000; index++) {
          let result = rand(256)
          console.log("################ ", index , result)
          if (result.indexOf('g') > -1) {
            console.log("@@@@@@@@@@@")
            throw new Error("出现 g 之后的字母 " + index)
          }
          if (result.indexOf('h') > -1) {
            console.log("@@@@@@@@@@@")
            throw new Error("出现 h 之后的字母 " + index)
          }
           if (result.indexOf('i') > -1) {
            console.log("@@@@@@@@@@@")
            throw new Error("出现 i 之后的字母 " + index)
           }
          
        }
       
    } catch (error) {
     
      console.log("XXXXXXXXXXXXXXXXXXXXXX  Error ", error)
    }
  })
})