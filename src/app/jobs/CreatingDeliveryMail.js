import Mail from '../../lib/Mail';

// job que envia um email avisando o provedor do cancelamaneto.
class CreatingDeliveryMail {
  /**
   * key() retorna a chave unica do job.
   */
  get key() {
    return 'CreatingDeliveryMail';
  }

  /**
   * handle() executa a tarefa quando o cancellationMail for executado.
   * recebe como parametros o 'data' contendo informações sobre o agendamento
   */
  async handle({ data }) {
    const { deliveryman, recipient, product } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Temos uma entrega pra você !',
      template: 'creatingDelivery',
      context: {
        deliveryman: deliveryman.name,
        recipient: recipient.name,
        product,
      },
    });
  }
}

export default new CreatingDeliveryMail();
