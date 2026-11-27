/*
  Quan ly ket noi WebSocket STOMP thoi gian thuc danh cho tram quet.
  Ho tro co che Event Hub du phong khi ket noi may chu chua san sang.
*/

class SocketClient {
  constructor() {
    this.subscribers = new Map()
    this.connected = false
    this.client = null
  }

  /*
    Dang ky lang nghe su kien tren mot kenh (topic).
  */
  subscribe(topic, callback) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set())
    }
    this.subscribers.get(topic).add(callback)

    return () => {
      const set = this.subscribers.get(topic)
      if (set) {
        set.delete(callback)
        if (set.size === 0) {
          this.subscribers.delete(topic)
        }
      }
    }
  }

  /*
    Phat su kien den tat ca cac ham lang nghe da dang ky tren kenh.
  */
  publish(topic, data) {
    const listeners = this.subscribers.get(topic)
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data)
        } catch (err) {
          console.error(`Lỗi thực thi listener trên kênh ${topic}:`, err)
        }
      })
    }
  }

  /*
    Kiem tra trang thai ket noi mang thoi gian thuc.
  */
  isConnected() {
    return this.connected
  }
}

const socketClient = new SocketClient()
export default socketClient
