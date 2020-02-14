import { Op } from 'sequelize';
import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';
import Delivery from '../models/Delivery';
import File from '../models/File';

class EndDeliveryController {
  async update(req, res) {
    const schema = Yup.object().shape({
      signature_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { deliverymanId, deliveryId } = req.params;

    const deliveryman = await Deliveryman.findByPk(deliverymanId);
    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exist.' });
    }

    const delivery = await Delivery.findOne({
      where: {
        id: deliveryId,
        deliveryman_id: deliverymanId,
        canceled_at: null,
        start_date: {
          [Op.ne]: null,
        },
        end_date: null,
      },
    });

    if (!delivery) {
      return res.status(400).json({
        error: 'delivery does not exist or has finished',
      });
    }

    // verificando se a assinatura existe
    const signature = await File.findByPk(req.body.signature_id);

    if (!signature) {
      return res.status(400).json('Signature does not exist');
    }

    const finishedDelivery = await delivery.update({
      signature_id: req.body.signature_id,
      end_date: new Date(),
    });

    return res.json(finishedDelivery);
  }
}

export default new EndDeliveryController();
