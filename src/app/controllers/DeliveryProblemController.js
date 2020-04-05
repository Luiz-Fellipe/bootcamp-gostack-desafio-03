import * as Yup from 'yup';
import DeliveryProblem from '../models/DeliveryProblem';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import Queue from '../../lib/Queue';
import CancelingDeliveryMail from '../jobs/CancelingDeliveryMail';

class DeliveryProblemController {
  async index(req, res) {
    const LIMIT_PER_PAGE = 5;
    const { page = 1 } = req.query;
    const response = await DeliveryProblem.findAndCountAll({
      attributes: ['id', 'description'],
      limit: LIMIT_PER_PAGE,
      offset: (page - 1) * LIMIT_PER_PAGE,
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id', 'product'],
          include: [
            {
              model: Deliveryman,
              as: 'deliveryman',
              attributes: ['id', 'name'],
            },
            {
              model: Recipient,
              as: 'recipient',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });

    const problemDeliveries = {
      problemDeliveries: response.rows,
      totalPages: Math.ceil(response.count / LIMIT_PER_PAGE),
    };

    return res.json(problemDeliveries);
  }

  async show(req, res) {
    const { deliveryId } = req.params;
    const { page = 1 } = req.query;

    const deliveries = await DeliveryProblem.findAll({
      where: {
        delivery_id: deliveryId,
      },
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id', 'product'],
          include: [
            {
              model: Deliveryman,
              as: 'deliveryman',
              attributes: ['id', 'name'],
            },
            {
              model: Recipient,
              as: 'recipient',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
      attributes: ['id', 'description'],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(deliveries);
  }

  async store(req, res) {
    const { deliveryId } = req.params;
    const { description } = req.body;
    const delivery = await Delivery.findOne({
      where: {
        id: deliveryId,
        canceled_at: null,
      },
      attributes: [
        'id',
        'product',
        'canceled_at',
        'initiated',
        'finished',
        'recipient_id',
        'deliveryman_id',
        'signature_id',
      ],
    });
    if (!delivery) {
      return res.status(400).json({
        error: 'delivery does not exist',
      });
    }

    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const deliveryProblem = await DeliveryProblem.create({
      delivery_id: deliveryId,
      description,
    });

    return res.json(deliveryProblem);
  }

  async delete(req, res) {
    const { deliveryProblemId } = req.params;

    const problemDelivery = await DeliveryProblem.findByPk(deliveryProblemId);

    if (!problemDelivery) {
      return res
        .status(400)
        .json({ error: 'This delivery problem does not exist' });
    }

    const delivery = await Delivery.findByPk(problemDelivery.delivery_id, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name'],
        },
      ],
    });

    const canceledDelivery = await delivery.update({
      canceled_at: new Date(),
    });

    // Envia o email ao entregador
    await Queue.add(CancelingDeliveryMail.key, {
      delivery,
      problemDelivery,
    });

    return res.json(canceledDelivery);
  }
}
export default new DeliveryProblemController();
