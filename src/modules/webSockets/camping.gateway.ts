import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Reservation } from '@prisma/client';

import { Server } from 'socket.io';
@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CampingGateway {
  @WebSocketServer()
  server: Server;

  notifyNewCamping(camping: any) {
    this.server.emit('newCampingCreated', camping);
  }

  notifyReservationPayment(reservation: Reservation) {
    this.server.emit('paymentConfirmed', reservation);
  }
}
