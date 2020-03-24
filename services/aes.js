
var crypto = require('crypto');
/**
 * aes加密
 * @param data
 * @param secretKey
 */
exports.aesEncrypt = function(data, secretKey) {
    var cipher = crypto.createCipher('aes-128-ecb',secretKey);
    return cipher.update(data,'utf8','hex') + cipher.final('hex');
};

/**
 * aes解密
 * @param data
 * @param secretKey
 * @returns {*}
 */
exports.aesDecrypt = function(data, secretKey){
    var cipher = crypto.createDecipher('aes-128-ecb',secretKey);
    return cipher.update(data,'hex','utf8') + cipher.final('utf8') ;
};

exports.decrypt = function(cryptkey, iv, encryptdata) {
    var m = crypto.createHash('md5');
    m.update(cryptkey);
    var key = m.digest();
    var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    return decipher.update(encryptdata,"hex","utf8")+decipher.final("utf8");

};

/*
console.log(aesEncrypt("在没有人的夜里","bXlEZWFyTFdX132df6bVGhlV2FudGVy"));

var cc="9eecfd07a996fa863ec95eac8b22715e0ad60400b84e77c9929d3059057250c2455788c95ed03a135168419250ebcb240f0dbe92feb01c304f8ddb900227db498652ab742176b130880088d68dca7d3857e9c611863b63c155010111975d2f8b6aae2a0a91bf1770b8bd7662deffd4bfea6443a250677c5ee533b64abc45d7c506e1d7cb87b64dec847667f36fa17fa0a7cf87d2a2d85ecace700d82e4cc1bd5d112b7ace705d0666ee93543bdd2514f1f9b012596d4d40683301d2cd1c42526a563f4a8a6cc2016008d97808a29c7334d99d3ae6b6876d4343018b14d4fcbfc8801547cfa8712e1a3aaa7af848a86da48654797a807da0a39d2638061d9966416fa1ce0537a6348281665cfda45fd0a19880ab33599526443e9cc745841fdc806fff7326172f6251a247872f9b6734848911feb37f5e7ebbbcc8613afcaa93beef43d12c981d773b173cdc9e97b61e617331457a98e419c770e30506f48a0e92d93390312d947e404ec06aa9d9e92ceb65852db70d4b921ac9ff3e9f25d21c8cd5d6a6321edc795f37cd710268d9d53"
;

var cbc="9e9335148d83879828140b1aedba2af85a9c310995b4f18d3760cc5b72fbf23a32c570e877d8e117ec2c1edb6a8d6faff71d1dc7003c5a233bd33e0a4bfbc5230d3ddc3e67549e807f427b573accfa4d372584cb3a191eac3b1d496d15c93793644a8b9d70c83fd7709d86e12b5b8b9e15ded3e3a9b6bcdaf72f3eb84765c2bed66a7829e9096e154535157d23ce96d11035432a51d0e1dacc3ab3cf3417c1d6215d71311ce7a2a5b44728c5602f282c481f5661ac3d1cce44bd8ce4fb04ca565d9bb7cc491d11533e5f9dab4c2e6b5eabc7574318800485c41ffd78cc8c2ebe8934996a28d46736b065a775793f78b2febab5da2351b46b284d664a10ddfcc61a93930ea3bbddba072b50bd119be98ca5accaea06b81ad96e1f2d42fc4b83561ae5a20d190bccb8787b6b2cd342297627f1312477cf7d2e0c0689bc4505d2b9afa8c7c1d3eaad9b0a398adc91bfb96075d813fa5e3874f9e540d7de73ab25f6a750239709b0325a900b2312b6e4dd5526d38a3acefc84bbe733b1b34849cd4b92a1e840fe59657c01e001ec196ed934"
;

console.log(this.aesDecrypt(cc,"bXlEZWFyTFdX132df6bVGhlV2FudGVy"));
var vi=new Buffer("1234567812345678");
var KEY="bXlEZWFyTFdX132df6bVGhlV2FudGVy";
console.log(this.decrypt(KEY,vi,cbc));*/
