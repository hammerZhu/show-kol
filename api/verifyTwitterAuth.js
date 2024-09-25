import { decrypt } from '../serverLib/serverLib';

export default async function handler(req, res) {
    if(req.method !== 'POST'){
        res.status(405).json({message:'Method not allowed'});
        return;
    }
   //验证客户端保存在localstorage中的twitter数据
   const twitterData = req.body.twitterData;
   console.log('twitterData=');
   console.log(twitterData);
   const decryptedData = decrypt(twitterData);
   const user = JSON.parse(decryptedData);
   if(user && user.screenName && user.accessToken && user.accessSecret){
    //能够正确解析就算成功了。
    console.log("user="+user.screenName);
    res.status(200).json(user.screenName);
    return;
   }
   //错误
   res.status(401).json({message:'Unauthorized'});
}