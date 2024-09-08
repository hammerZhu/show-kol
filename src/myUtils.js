// 格式化日期
export function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // 计算两个数字的和
  export function sum(a, b) {
    return a + b;
  }
  
  // 将字符串首字母大写
  export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  // 检查是否为空对象
  export function isEmptyObject(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }
  // 发送POST请求到后台服务器
  export async function sendDbRequest(sqlstr){
    let token='5544Bdc2';
    let data=JSON.stringify({token:token,sqlite3:sqlstr});
    let api='exec_private_sqlite3';
    let result=await sendPostRequest(api,data);
    return result;
  }
  export async function sendPostRequest(api,data) {
    let url = `https://tweetbox.xyz/api/v2/${api}`;
   // let url = `http://localhost:3000/api/v2/${api}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      console.log('响应状态:', response.status);
      console.log('响应头:', response.headers);
      if (!response.ok) {
        console.error('响应不正常:', await response.text());
        throw new Error(`HTTP 错误! 状态: ${response.status}`);
      }
      const result = await response.json();
      console.log('响应数据:', result);
      return result;
    } catch (error) {
      console.error('请求错误:', error);
      return null;
    }
  }