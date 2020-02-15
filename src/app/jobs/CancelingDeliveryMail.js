import Mail from '../../lib/Mail';

class CancelingDeliveryMail {
  get key() {
    return 'CancelingDeliveryMail';
  }

  async handle({ data }) {
    const { delivery, problemDelivery } = data;

    await Mail.sendMail({
      to: `${delivery.deliveryman.name} <${delivery.deliveryman.email}>`,
      subject: 'Entrega cancelada !',
      template: 'cancelingDelivery',
      context: {
        deliveryman: delivery.deliveryman.name,
        recipient: delivery.recipient.name,
        product: delivery.product,
        reason: problemDelivery.description,
      },
    });
  }
}

export default new CancelingDeliveryMail();
