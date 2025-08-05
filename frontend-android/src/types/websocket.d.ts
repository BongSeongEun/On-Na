declare module 'sockjs-client' {
  export default class SockJS {
    constructor(url: string, protocols?: string | string[], options?: any);
    readyState: number;
    url: string;
    protocol: string;
    onopen: ((event: any) => void) | null;
    onclose: ((event: any) => void) | null;
    onmessage: ((event: any) => void) | null;
    onerror: ((event: any) => void) | null;
    close(code?: number, reason?: string): void;
    send(data: string | ArrayBuffer): void;
  }
}

declare module '@stomp/stompjs' {
  export interface Client {
    webSocketFactory?: () => any;
    debug?: (str: string) => void;
    reconnectDelay?: number;
    heartbeatIncoming?: number;
    heartbeatOutgoing?: number;
    onConnect?: (frame: any) => void;
    onStompError?: (frame: any) => void;
    activate(): void;
    deactivate(): void;
    subscribe(destination: string, callback: (message: any) => void): any;
    publish(options: { destination: string; body: string }): void;
  }

  export class Client {
    constructor(config: any);
    webSocketFactory?: () => any;
    debug?: (str: string) => void;
    reconnectDelay?: number;
    heartbeatIncoming?: number;
    heartbeatOutgoing?: number;
    onConnect?: (frame: any) => void;
    onStompError?: (frame: any) => void;
    activate(): void;
    deactivate(): void;
    subscribe(destination: string, callback: (message: any) => void): any;
    publish(options: { destination: string; body: string }): void;
  }
} 