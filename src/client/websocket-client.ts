import WebSocket from 'ws';
import { EventEmitter } from 'events';
import axios from 'axios';
import {
  SignalType,
  WebSocketSignal,
  HelloData,
  EventData,
  KookSDKOptions,
} from '../types';

// KOOK API 基础 URL
const API_BASE_URL = 'https://www.kookapp.cn/api/v3';

interface WebSocketClientOptions {
  token: string;
  compress?: boolean;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private options: Required<WebSocketClientOptions>;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private sessionId: string | null = null;
  private lastSequenceNumber = 0;
  private isManualClose = false;
  private heartbeatIntervalMs = 30000;
  private gatewayUrl: string | null = null;

  constructor(options: WebSocketClientOptions) {
    super();
    this.options = {
      compress: options.compress ?? false,
      autoReconnect: options.autoReconnect ?? true,
      reconnectInterval: options.reconnectInterval ?? 5000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 10,
      token: options.token,
    };
  }

  // 获取网关地址
  private async getGatewayUrl(): Promise<string> {
    try {
      const response = await axios.get(`${API_BASE_URL}/gateway/index`, {
        headers: {
          Authorization: `Bot ${this.options.token}`,
        },
        params: {
          compress: this.options.compress ? 1 : 0,
        },
      });

      if (response.data.code !== 0) {
        throw new Error(response.data.message);
      }

      return response.data.data.url;
    } catch (error: any) {
      throw new Error(`Failed to get gateway URL: ${error.message}`);
    }
  }

  // 连接到 WebSocket 网关
  async connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // 获取网关地址
        if (!this.gatewayUrl) {
          this.gatewayUrl = await this.getGatewayUrl();
          this.emit('debug', `Got gateway URL: ${this.gatewayUrl}`);
        }

        // 构建连接 URL
        let url = this.gatewayUrl;
        if (this.options.compress) {
          url += url.includes('?') ? '&compress=1' : '?compress=1';
        }
        
        this.ws = new WebSocket(url, {
          headers: {
            Authorization: `Bot ${this.options.token}`,
          },
        });

        this.ws.on('open', () => {
          this.emit('debug', 'WebSocket connection opened');
        });

        this.ws.on('message', (data: WebSocket.RawData) => {
          this.handleMessage(data);
        });

        this.ws.on('close', (code: number, reason: Buffer) => {
          this.emit('debug', `WebSocket closed: ${code} - ${reason.toString()}`);
          this.cleanup();
          
          if (!this.isManualClose && this.options.autoReconnect) {
            this.attemptReconnect();
          }
        });

        this.ws.on('error', (error: Error) => {
          this.emit('error', error);
          reject(error);
        });

        // 等待 HELLO 消息
        const onHello = () => {
          this.reconnectAttempts = 0;
          resolve();
        };
        this.once('hello', onHello);

      } catch (error) {
        reject(error);
      }
    });
  }

  // 处理 WebSocket 消息
  private handleMessage(data: WebSocket.RawData): void {
    try {
      const signal: WebSocketSignal = JSON.parse(data.toString());
      this.emit('debug', `Received signal: ${signal.s}`);

      switch (signal.s) {
        case SignalType.HELLO:
          this.handleHello(signal.d as HelloData);
          break;
        case SignalType.EVENT:
          this.handleEvent(signal);
          break;
        case SignalType.PONG:
          this.emit('pong');
          break;
        case SignalType.RECONNECT:
          this.handleReconnect();
          break;
        default:
          this.emit('debug', `Unknown signal type: ${signal.s}`);
      }
    } catch (error) {
      this.emit('error', new Error(`Failed to parse message: ${error}`));
    }
  }

  // 处理 HELLO 消息
  private handleHello(data: HelloData): void {
    this.sessionId = data.session_id;
    this.heartbeatIntervalMs = data.heartbeat_interval;
    
    this.emit('hello', data);
    this.emit('ready');
    
    // 开始心跳
    this.startHeartbeat();
  }

  // 处理事件消息
  private handleEvent(signal: WebSocketSignal): void {
    if (signal.sn) {
      this.lastSequenceNumber = signal.sn;
    }

    const eventData = signal.d as EventData;
    this.emit('event', eventData);

    // 系统事件 (type = 255)
    if (eventData.type === 255) {
      this.handleSystemEvent(eventData);
      return;
    }

    // 根据事件类型分发
    const eventType = this.getEventName(eventData.type, eventData.channel_type);
    if (eventType) {
      this.emit(eventType, eventData);
    }
  }

  // 处理重连请求
  private handleReconnect(): void {
    this.emit('debug', 'Server requested reconnect');
    this.disconnect();
    this.attemptReconnect();
  }

  // 开始心跳
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      this.sendPing();
    }, this.heartbeatIntervalMs);
  }

  // 停止心跳
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 发送 PING
  private sendPing(): void {
    // 检查 WebSocket 是否处于打开状态
    if (this.ws?.readyState !== WebSocket.OPEN) {
      this.emit('debug', 'Skipping ping: WebSocket is not open');
      return;
    }
    this.send({ s: SignalType.PING, d: {} });
    this.emit('ping');
  }

  // 发送消息
  private send(data: WebSocketSignal): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      // 只在非关闭状态下报错，避免关闭过程中的误报
      if (this.ws && this.ws.readyState !== WebSocket.CLOSING && this.ws.readyState !== WebSocket.CLOSED) {
        this.emit('error', new Error('WebSocket is not open'));
      }
    }
  }

  // 尝试重连
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.emit('error', new Error('Max reconnect attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    this.emit(
      'debug',
      `Reconnecting... Attempt ${this.reconnectAttempts}/${this.options.maxReconnectAttempts}`
    );

    setTimeout(() => {
      this.connect().catch((error) => {
        this.emit('error', error);
      });
    }, this.options.reconnectInterval);
  }

  // 清理资源
  private cleanup(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws = null;
    }
  }

  // 断开连接
  disconnect(): void {
    this.isManualClose = true;
    this.cleanup();
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }

  // 获取事件名称
  private getEventName(type: number, channelType?: string): string | null {
    // 消息类型 (1-10, 12)
    if (type >= 1 && type <= 10) {
      return 'message';
    }

    // 系统事件类型 (type = 255)
    // 系统事件需要通过 extra.type 来判断，这里只是基础映射
    const systemEventMap: Record<number, string> = {
      0: 'joined_guild',
      1: 'exited_guild',
      11: 'guild_member_update',
      12: 'channel_create',
      13: 'channel_delete',
      14: 'channel_update',
      21: 'message_delete',
      22: 'message_update',
      27: 'reaction_add',
      28: 'reaction_remove',
      31: 'private_message_delete',
      36: 'guild_update',
      37: 'guild_delete',
      40: 'guild_role_create',
      41: 'guild_role_delete',
      42: 'guild_role_update',
      50: 'user_update',
      55: 'self_joined_guild',
      56: 'self_exited_guild',
      62: 'message_btn_click',
    };

    // 成员在线/离线状态 (根据 channel_type 判断)
    if (type === 8) {
      return channelType === 'PERSON' ? 'guild_member_online' : 'message';
    }
    if (type === 9) {
      return channelType === 'PERSON' ? 'guild_member_offline' : 'message';
    }

    return systemEventMap[type] || null;
  }

  // 处理系统事件 (type = 255)
  private handleSystemEvent(eventData: EventData): void {
    const extra = eventData.extra as { type: string; body: unknown };
    const systemEventType = extra?.type;

    if (!systemEventType) return;

    // 系统事件映射表
    const systemEventMap: Record<string, string> = {
      // 服务器成员相关
      'joined_guild': 'joined_guild',
      'exited_guild': 'exited_guild',
      'updated_guild_member': 'guild_member_update',
      'guild_member_online': 'guild_member_online',
      'guild_member_offline': 'guild_member_offline',

      // 服务器相关
      'updated_guild': 'guild_update',
      'deleted_guild': 'guild_delete',
      'added_block_list': 'added_block_list',
      'deleted_block_list': 'deleted_block_list',
      'added_emoji': 'added_emoji',
      'removed_emoji': 'removed_emoji',
      'updated_emoji': 'updated_emoji',

      // 频道相关
      'added_channel': 'channel_create',
      'updated_channel': 'channel_update',
      'deleted_channel': 'channel_delete',

      // 消息相关
      'updated_message': 'message_update',
      'deleted_message': 'message_delete',
      'pinned_message': 'pinned_message',
      'unpinned_message': 'unpinned_message',

      // 反应相关
      'added_reaction': 'reaction_add',
      'deleted_reaction': 'reaction_remove',

      // 角色相关
      'added_role': 'guild_role_create',
      'deleted_role': 'guild_role_delete',
      'updated_role': 'guild_role_update',

      // 用户相关
      'user_updated': 'user_update',
      'self_joined_guild': 'self_joined_guild',
      'self_exited_guild': 'self_exited_guild',

      // 语音频道
      'joined_channel': 'joined_channel',
      'exited_channel': 'exited_channel',

      // 卡片消息
      'message_btn_click': 'message_btn_click',
    };

    const eventName = systemEventMap[systemEventType];
    if (eventName) {
      this.emit(eventName, eventData);
    }

    // 同时触发通用的系统事件
    this.emit('system_event', eventData);
  }

  // 获取连接状态
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // 获取会话 ID
  get sessionID(): string | null {
    return this.sessionId;
  }
}
