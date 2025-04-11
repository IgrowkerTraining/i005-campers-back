export class CreatePaymentPreferenceDTO {
    reservationId: string;
    amount: number;
    description: string;
  }
  
  export class PaymentPreferenceDTO {
    preferenceId: string;
    paymentUrl: string;
  }