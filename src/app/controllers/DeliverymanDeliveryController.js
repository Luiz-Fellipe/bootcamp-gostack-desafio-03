import { Op } from 'sequelize';
import Delivery from '../models/Delivery';

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
    });

    return res.json(deliveries);
  }
}

export default new DeliverymanDeliveryController();
