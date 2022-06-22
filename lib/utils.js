/*
 * @Descripttion: 
 * @Date: 2022-04-12 18:07:33
 * @LastEditTime: 2022-06-22 16:36:32
 */
var asmCrypto = require("asmcrypto.js");

var bip39 = require("./bip39/index.js");
var {
  hdkey
} = require("ethereumjs-wallet");
var ethUtil = require("ethereumjs-util");

var {
  customAlphabet
} = require("nanoid");
const DIGITS = '1234567890abcdef'
const nanoid = customAlphabet(DIGITS)

function Sha256SaltRandom(salt) {

  let fillerWord = "c";
  let msg = `solarchain${fillerWord}${salt}`;
  let msgBytes = asmCrypto.string_to_bytes(msg);
  let sha256 = new asmCrypto.Sha256();
  let result = sha256.process(msgBytes).finish().result;


  let sha256_2 = new asmCrypto.Sha256();
  let result_2 = sha256_2.process(result).finish().result;
  return result_2;
}


function onPBKDF2_HMAC_SHA512(salt, pass) {
  let obj = {
    password: asmCrypto.string_to_bytes(pass),
    salt: salt,
    count: 100000,
    dklen: 64
  };


  let unit8Array = asmCrypto.Pbkdf2HmacSha512(
    obj.password,
    obj.salt,
    obj.count,
    obj.dklen
  );

  let startKey = unit8Array.slice(0, 16);
  let endKey = unit8Array.slice(unit8Array.length - 16);
  // endKey = asmCrypto.bytes_to_hex(endKey);
  return {
    startKey,
    endKey
  };
}
async function onAESECB(masterKey, result, endKey) {

  // 5.
  const salt = nanoid(64)


  result.masterKey = salt
  let data = asmCrypto.hex_to_bytes(salt);
  // console.log("256 data = ", data, salt.length)
  // 加密主密钥
  let encryptMasterKey = asmCrypto.AES_ECB.encrypt(data, masterKey);

  // 加密主密钥转普通数组
  var encryptMasterKeyArray = Array.from(encryptMasterKey);
  // 派生验证密钥转普通数组
  var endKeyArray = Array.from(endKey);

  const cryptographicAuthenticationMasterKeyArray = encryptMasterKeyArray.concat(endKeyArray)
  // console.log("加密验证主密钥 cryptographicAuthenticationMasterKeyArray = ",
  //   cryptographicAuthenticationMasterKeyArray)

  // 加密验证主密钥由普通数组转为Uint8Array
  const cryptographicAuthenticationMasterKeyUint8Array = new Uint8Array(cryptographicAuthenticationMasterKeyArray)

  const cryptographicAuthenticationMasterKeyHex = asmCrypto.bytes_to_hex(cryptographicAuthenticationMasterKeyUint8Array);

  result.cryptographicAuthenticationMasterKeyHex = cryptographicAuthenticationMasterKeyHex

  let masterKeyEncHex = asmCrypto.bytes_to_hex(encryptMasterKey);

  result.masterKeyEncryptHex = masterKeyEncHex
  let master_key_encrypt = asmCrypto.hex_to_bytes(masterKeyEncHex);

  let resultMasterKey = asmCrypto.AES_ECB.decrypt(
    master_key_encrypt,
    masterKey
  );
  resultMasterKey = asmCrypto.bytes_to_hex(resultMasterKey)

  await setMnemonics(resultMasterKey, result)

}


async function setMnemonics(resultMasterKey, result) {
  try {
    let mnemonic = bip39.generateMnemonic(resultMasterKey);
    let seed = await bip39.mnemonicToSeed(mnemonic);
    let hdWallet = await hdkey.fromMasterSeed(seed);
    let addressTotal = 1;
    let addressArray = [];
    for (let i = 0; i < addressTotal; i++) {
      let item = {};
      item.keyName = "m/44'/60'/0'/0/" + i;
      item.key = hdWallet.derivePath("m/44'/60'/0'/0/" + i);
      item.publicKey = "0x" + item.key._hdkey._publicKey.toString("hex");
      item.account = item.key._hdkey.index;
      item.privateKey = "0x" + item.key._hdkey._privateKey.toString("hex");
      item._privateKey = item.key._hdkey._privateKey;
      let address = ethUtil.pubToAddress(item.key._hdkey._publicKey, true);
      item.address = ethUtil.toChecksumAddress("0x" + address.toString("hex"));
      item.account_name = item.address;
      addressArray.push(item);
    }
    result.address = addressArray[0].address
    result.mnemonic = mnemonic

  } catch (error) {
    console.log("error = ", error)
  }
}

async function createWallet(password) {
  try {
    if (!password) {
      return {
        error: "password is empty"
      }
    }
    let result = {
      password: password
    }

    // 1.
    const salt = nanoid(32)

    result.saltRandom = salt

    // 2.
    let saltSHA256Result = Sha256SaltRandom(salt);
    // 3.4.
    let {
      startKey,
      endKey
    } = onPBKDF2_HMAC_SHA512(saltSHA256Result, password);
    await onAESECB(startKey, result, endKey);
    return result
  } catch (error) {
    console.error("error = ", error)
    return {
      error: error
    }
  }

}

async function decryptMasterKey(saltRandom, cryptographicAuthenticationMasterKeyHex, password) {
  if (!(saltRandom && cryptographicAuthenticationMasterKeyHex && password)) {
    return {
      error: "invalid parameter"
    }
  }
  const salt = saltRandom
  // SHA256加密
  const resultSha256 = await Sha256SaltRandom(salt)

  // PBKDF2_HMAC_SHA512 加密，生成派生加密密钥，派生认证密钥
  const {
    startKey,
    endKey
  } = await onPBKDF2_HMAC_SHA512(
    resultSha256,
    password
  )
  // 类型转换
  const cryptographicAuthenticationMasterKeyUint8Array = asmCrypto.hex_to_bytes(cryptographicAuthenticationMasterKeyHex)

  // 对加密验证主密钥进行分割（加密主密钥 + 派生验证密钥）
  let startKey_1 = cryptographicAuthenticationMasterKeyUint8Array.slice(0, 32);
  let endKey_1 = cryptographicAuthenticationMasterKeyUint8Array.slice(32);

  const endKeyHex = asmCrypto.bytes_to_hex(endKey)
  const endKey_1_Hex = asmCrypto.bytes_to_hex(endKey_1)


  let result = {}
  // 验证密码错误
  if (endKeyHex && endKey_1_Hex && endKeyHex === endKey_1_Hex) {
    // 解密主密钥
    let master_key = startKey_1
    const resultMasterKey = await asmCrypto.AES_ECB.decrypt(
      master_key,
      startKey
    )
    let masterKeyHex = await asmCrypto.bytes_to_hex(resultMasterKey)
    result.masterKey = masterKeyHex
    // 生成助记词
    await setMnemonics(resultMasterKey, result)
    return result
  } else {
    result = {
      error: "wrong password"
    }
    return result
  }

}


exports.createWallet = createWallet

exports.decryptMasterKey = decryptMasterKey