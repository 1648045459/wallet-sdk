根据输入的加密密码随机生成钱包地址、加密主密钥、助记词、随机数。

安装：
```
npm i wallet-utils-create --save
```



异步处理（async + await）：
```
import walletSdk from 'wallet-utils-create';

const password = "123456"
await walletSdk.createWallet(password)

>
{
  password: '123456',
  saltRandom: '442da9870f1c1ad5945b8c4e8355c84a',
  masterKey: '298edb7103faf0dd4642ec508ee3a3fd5585220a4f78c3e6851ab9b74cd3e0e6',
  cryptographicAuthenticationMasterKeyHex: 'd7faae8ca58e8b36d60e7530a4abe9fd2876228f3df5c8809caea5eb603bb9638a4a6dc0c993470653d7cfd464cf46aa',
  masterKeyEncryptHex: 'd7faae8ca58e8b36d60e7530a4abe9fd2876228f3df5c8809caea5eb603bb963',
  address: '0x7B6Ca4F8A3E5cf734C1208B96CF767482DeA799f',
  mnemonic: 'civil item sword among pyramid huge boil frown explain jacket trophy wide flame much circle upper sentence crouch effort inflict inquiry hazard logic scheme'
}


await walletSdk.decryptMasterKey(saltRandom, cryptographicAuthenticationMasterKeyHex, password)

>
{
  masterKey: '298edb7103faf0dd4642ec508ee3a3fd5585220a4f78c3e6851ab9b74cd3e0e6',
  address: '0x7B6Ca4F8A3E5cf734C1208B96CF767482DeA799f',
  mnemonic: 'civil item sword among pyramid huge boil frown explain jacket trophy wide flame much circle upper sentence crouch effort inflict inquiry hazard logic scheme'
}
```


参数注释：
```
password: '密码',
saltRandom: '随机数',
masterKey: '主密钥',
cryptographicAuthenticationMasterKeyHex: '加密验证主密钥',
masterKeyEncryptHex: '加密主密钥',
address: '公钥地址',
mnemonic: '助记词'
```


注：不支持 vue3 + vite