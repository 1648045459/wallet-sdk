/*
 * @Descripttion: 
 * @Date: 2022-04-12 18:18:24
 * @LastEditTime: 2022-06-22 18:23:05
 */
var utils = require('../lib/utils.js')

describe('utils:功能测试', function () {
  describe('utils.createWallet', async function () {
    console.log(utils)
    try {
      const length = 0
      for (let index = 0; index <= length; index++) {
        console.time(index)
        //获取钱包数据
        let result = await utils.createWallet("123456")
        console.log("#### 生成钱包数据 result = ", result)

        // 解密主密钥
        // result.password = "2222"
        let result2 = await utils.decryptMasterKey(result.saltRandom, result.cryptographicAuthenticationMasterKeyHex, result.password)
        console.log("####  result2 = ", result2)
        // console.log(result.masterKey, result2.masterKey)
        if (result.masterKey === result2.masterKey) {
          console.timeEnd(index)
          console.log("---------------- end -------------- ", index)
        } else {
          throw new Error("解密失败：解密后的主密钥不等解密前数据 " + index)
        }
        if (index === length) {
          console.log("@@@@@@@@@@@@@@@@@@@@ 循环结束 @@@@@@@@@@@@@@@@@@@")
        }
      }
    } catch (error) {
      console.log("XXXXXXXXXXXXXXXXXXXXXX  Error ", error)
    }
  })
})