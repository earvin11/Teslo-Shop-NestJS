import { JwtService } from '@nestjs/jwt';
import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { SubscribeMessage, WebSocketServer } from '@nestjs/websockets/decorators';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { NewMessageDto } from './dto/new-message.dto';
import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection( client: Socket ) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify( token );
      await this.messagesWsService.registerClient( client, payload.id );
    } catch (error) {
      client.disconnect();
      return;
    }

    // console.log({ payload });
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
    // console.log('Cliente conectado: ', client.id);
    // console.log({ online: this.messagesWsService.getConnectedClients() });
  }

  handleDisconnect( client: Socket ) {
    // console.log('Cliente desconectado: ', client.id);
    this.messagesWsService.removeClient(client.id);
    // console.log({ online: this.messagesWsService.getConnectedClients() });
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }


  // decorador para reaccionar a los eventos que emite el client
  @SubscribeMessage('message-from-client')
  onMessageFromClient( client: Socket, payload: NewMessageDto) {
    
    // client para emitir el event solo al client que escuchamos
    // client.emit('message-from-server', {
    //   fullName: 'yo',
    //   message: payload.message
    // });

    // Emitir a todos menos al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'yo',
    //   message: payload.message
    // });

    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message
    });

  }


}
