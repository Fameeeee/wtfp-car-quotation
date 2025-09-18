import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuditLog } from './audit.entity';

@WebSocketGateway({ namespace: '/logs', cors: true })
export class AuditLogGateway {
  @WebSocketServer()
  server: Server;

  emitLog(log: AuditLog) {
    this.server.emit('log', log);
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: any) {
    return { event: 'pong', data };
  }
}
