import { Op } from 'sequelize';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import File from '../models/File';

class DeliverymanDeliveryController {
  async index(req, res) {
    const { filter } = req.query;

    const deliveries = await Delivery.findAll({
      where: {
        deliveryman_id: req.params.id,
        start_date:
          filter === 'opened' || filter === 'finished'
            ? {
                [Op.ne]: null,
              }
            : null,
        end_date:
          filter === 'finished'
            ? {
                [Op.ne]: null,
              }
            : null,
        canceled_at: null,
      },
      attributes: [
        'id',
        'product',
        'start_date',
        'end_date',
        'finished',
        'initiated',
      ],
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'email', 'name'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name', 'city', 'zip_code'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(deliveries);
  }
}

export default new DeliverymanDeliveryController();
