//两个实例之间是不一样的，注意他们之间的关系
export default class SocketClient {
  static instanceMap = new Map();
  url = "";
  // #重连次数
  reconnectAttempts = 0;
  // #最大重连数
  maxReconnectAttempts = 5;
  // #重连间隔
  reconnectInterval = 5000; // 2 seconds
    // #发送心跳数据间隔
   heartbeatInterval = 1000 * 30;
    // #计时器id
    heartbeatTimer=null;
    // #彻底终止ws
  stopWs = false;

  constructor(url) {
    this.url = url;
  }
  //单例模式是创建类的实例，不是单个属性的实例！
  static getInstance(url) {
    if (!SocketClient.instanceMap.has(url)) {
      SocketClient.instanceMap.set(url, new SocketClient(url));
    }
    return SocketClient.instanceMap.get(url);
  }
  SendMseeage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      console.log("WebSocket未连接，无法发送消息");
    }
  }
  //在 connect 方法中，初始化 WebSocket 连接并为其设置事件处理函数。特别关注 onclose 和 onerror 事件，在连接关闭和出现错误时调用重连逻辑。
  Connect() {
    this.stopWs = false
    if(this.ws)
    this.ws.close();
    //仅!this.ws让我们无法执行重链逻辑
    // if (!this.ws) {
      //创建WebSocket实例就是链接？
      //这行代码本身是创建一个新的 WebSocket 连接，而非 “重新连接” 的完整实现 —— 它只是重新连接逻辑中的核心一步，但单独使用无法完成自动重连。
      this.ws = new WebSocket(this.url);
    // }
    // !websocket连接成功
    this.ws.onopen = () => {
      console.log(`连接成功,等待服务端数据推送[${this.url}]...`);
    };

    this.ws.onclose = () => {
      if (this.reconnectAttempts === 0) {
        console.log(`连接断开[onclose]...`);
      }
      this.handleReconnect();
    };

    this.ws.onerror = () => {
      if (this.reconnectAttempts === 0) {
        console.log(`连接断开[onclose]...`);
      }
    //   this.handleReconnect();
    };
  }
  // >关闭连接
  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.stopWs = true
      this.closeHeartbeat();
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`正在尝试第${this.reconnectAttempts}次重连...`);
      setTimeout(() => {
        this.Connect();
      }, this.reconnectInterval);
    } else {
      console.log(`最大重连失败，终止重连: ${this.url}`);
    }
  }

  // >开始心跳检测 -> 定时发送心跳消息
    startHeartbeat(){
        if (this.stopWs) return;
        if (this.heartbeatTimer) {
            this.closeHeartbeat();
        }
        this.heartbeatTimer = setInterval(() => {
            if (this.socket) {
                this.socket.send(JSON.stringify({ type: 'heartBeat', data: {} }));
                console.log('WebSocket', '送心跳数据...');
            } else {
                console.error('[WebSocket] 未连接');
            }
        }, this.heartbeatInterval);
    }

    // >关闭心跳
     closeHeartbeat(){
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = undefined;
    }


}

//其实不适合使用单例模式
//单例模式的核心思想是确保一个类只有一个实例。但在你的场景中：

// 不同的 URL 需要不同的 WebSocket 连接 - 如果你需要同时连接多个 WebSocket 服务器（不同的 URL），单例模式就无法满足需求
// URL 作为构造参数 - 每次传入不同的 URL 应该创建不同的实例，但单例模式会阻止这一点



{
    //问题：两个handleReconnect会同时调用
}