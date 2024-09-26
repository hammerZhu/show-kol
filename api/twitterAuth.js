//import axios from 'axios';
import { TwitterApi } from 'twitter-api-v2';
//import { encrypt, decrypt } from '../src/myUtils'; // 假设您有加密和解密函数
import { encrypt, decrypt } from '../serverLib/serverLib';

let savedOauthToken="";
let savedSecret="";
const API_KEY=process.env.REACT_APP_X_API_KEY;
const API_SECRET=process.env.REACT_APP_X_API_SECRET;  
export default async function handler(req, res) {
    if(req.method==='GET'){
        // 获取请求令牌
        console.log("API_KEY="+API_KEY);
        console.log("API_SECRET="+API_SECRET);
        const client = new TwitterApi({
            appKey: API_KEY,
            appSecret: API_SECRET,
        });
        const link = await client.generateAuthLink(`https://show-kol.vercel.app/loginTwitter`);
       //const link = await client.generateAuthLink(`http://localhost:3000/loginTwitter`);
        //console.log("screct="+link.oauth_token_secret);
        const encryptedSecret = encrypt(link.oauth_token_secret);
        res.setHeader('Set-Cookie', `twitterSecret=${encryptedSecret}; HttpOnly; Path=/; Max-Age=3600`);
        res.status(200).json(link.url);

    }else if(req.method === 'POST'){
        let data=req.body;
        // 通过回调 URL 获取访问令牌
        console.log("Author get data");
        console.log(data);
        const verifier = data.oauthVerifier;
        const token = data.oauthToken;
        const encryptedSecret = req.cookies.twitterSecret;

        if (!token || !verifier || !encryptedSecret) {
            res.status(400).json('Bad request, or you denied application access. Please renew your request.');
            return;
        }

        const savedSecret = decrypt(encryptedSecret);

        //todo检查token是否和保存的token相同。
        console.log("token="+token);
        console.log("verifier="+verifier);

        console.log("savedSecret="+savedSecret);
        // Build a temporary client to get access token
        const tempClient = new TwitterApi({ 
            appKey: API_KEY,
            appSecret: API_SECRET,
            accessToken: token, 
            accessSecret: savedSecret });

        // Ask for definitive access token
        const result = await tempClient.login(verifier);
       // console.log("login result=");
       // console.log(result);
        //登录成功，得到用户名 todo
        res.setHeader('Set-Cookie', 'twitterSecret=; HttpOnly; Path=/; Max-Age=0');
        let savedCookie={
            screenName:result.screenName,
            userId:result.userId,
            accessToken:result.accessToken,
            accessSecret:result.accessSecret
        }
        console.log("login success");
        const encryptedData = encrypt(JSON.stringify(savedCookie));
        //res.setHeader('Set-Cookie', `twitterData=${encryptedData}; HttpOnly; Path=/; Max-Age=2592000`);
        res.status(200).json({userName:result.screenName,twitterData:encryptedData});
    }
}
