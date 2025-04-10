import { Injectable } from '@nestjs/common';
import { CreatePaymentPreferenceDTO } from './dto/create-mercado-pago.dto';
import { UpdateMercadoPagoDto } from './dto/update-mercado-pago.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference } from 'mercadopago';



@Injectable()
export class MercadoPagoService {
private client: MercadoPagoConfig;

  constructor(
    private configService: ConfigService,
    private readonly prisma: PrismaService) {

    this.client = new MercadoPagoConfig({ 
      accessToken: this.configService.get(process.env.ACCESS_TOKEN),
     });
    }

;
    async createUrlPayment(price: number): Promise<string> {
      const preferences = new this.client.preferences({
        items: [{
          title: 'Reserva Camping',
          quantity: 1,
          currency_id: 'ARS',
          unit_price: price,
        }],
      });
  
      const response = await preferences.create();
      return response.body.init_point;
    }
  

  findAll() {
    return `This action returns all mercadoPago`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mercadoPago`;
  }

  update(id: number, updateMercadoPagoDto: UpdateMercadoPagoDto) {
    return `This action updates a #${id} mercadoPago`;
  }

  remove(id: number) {
    return `This action removes a #${id} mercadoPago`;
  }


}