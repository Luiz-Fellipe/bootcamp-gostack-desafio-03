import { Op } from 'sequelize';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import File from '../models/File';

class DeliverymanDeliveryController {
  async index(req, res) {
    const { page = 1, filter, product } = req.query;

    /**
     * Se ele não informar o ele lista todas as entregas, independente do status.
     * Se o filter for igual a 'opened' ele lista todas as entregas em aberto.
     * Se o filter for igual a 'finished' ele lista todas as entregas finalizadas.
     * Se o filter for igual a 'canceled' ele lista todas as entregas canceladas.
     */
    const deliveries = await Delivery.findAll(
      filter
        ? {
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
              canceled_at:
                filter === 'canceled'
                  ? {
                      [Op.ne]: null,
                    }
                  : null,
              product: product
                ? {
                    [Op.like]: `%${product}%`,
                  }
                : { [Op.ne]: null },
            },
            attributes: [
              'id',
              'product',
              'start_date',
              'end_date',
              'finished',
              'initiated',
            ],
            limit: 20,
            offset: (page - 1) * 20,
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
          }
        : {
            limit: 20,
            offset: (page - 1) * 20,
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
          }
    );

    return res.json(deliveries);
  }
}

export default new DeliverymanDeliveryController();
