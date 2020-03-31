import * as Yup from 'yup';
import { Op } from 'sequelize';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

import Recipient from '../models/Recipient';
import Queue from '../../lib/Queue';
import CreatingDeliveryMail from '../jobs/CreatingDeliveryMail';

class DeliveryController {
  async index(req, res) {
    const LIMIT_PER_PAGE = 5;
    const { page = 1, product } = req.query;

    const response = await Delivery.findAndCountAll({
      order: [['id', 'DESC']],
      where: {
        product: product
          ? {
              [Op.like]: `%${product}%`,
            }
          : { [Op.ne]: null },
      },
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['url', 'name', 'path'],
            },
          ],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'city',
            'uf',
            'street',
            'number',
            'zip_code',
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'url', 'path'],
        },
      ],
      attributes: [
        'id',
        'product',
        'initiated',
        'finished',
        'canceled',
        'start_date',
        'end_date',
        'signature_id',
        'canceled_at',
      ],

      limit: LIMIT_PER_PAGE,
      offset: (page - 1) * LIMIT_PER_PAGE,
    });
    // manipulando a respota, para adicionar o total de páginas

    const deliveries = {
      deliveries: response.rows,
      totalPages: Math.ceil(response.count / LIMIT_PER_PAGE),
    };

    return res.json(deliveries);
  }

  async show(req, res) {
    const delivery = await Delivery.findByPk(req.params.id, {
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
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'url', 'path'],
        },
      ],
    });

    return res.json(delivery);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id, {
      attributes: ['name', 'email'],
    });

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exist.' });
    }

    const recipient = await Recipient.findByPk(recipient_id, {
      attributes: ['name'],
    });

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exist.' });
    }

    const newDelivery = await Delivery.create({
      recipient_id,
      deliveryman_id,
      product,
    });

    // Envia o email ao entregador
    await Queue.add(CreatingDeliveryMail.key, {
      deliveryman,
      product,
      recipient,
    });

    return res.status(201).json(newDelivery);
  }

  async update(req, res) {
    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exist ' });
    }

    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      product: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    if (req.body.deliveryman_id) {
      const deliveryman = await Deliveryman.findByPk(req.body.deliveryman_id, {
        attributes: ['name', 'email'],
      });
      if (!deliveryman) {
        return res.status(400).json({ error: 'Deliveryman does not exist.' });
      }
    }

    if (req.body.recipient_id) {
      const recipient = await Recipient.findByPk(req.body.recipient_id, {
        attributes: ['name'],
      });

      if (!recipient) {
        return res.status(400).json({ error: 'Recipient does not exist.' });
      }
    }

    const newDelivery = await delivery.update(req.body);

    return res.json(newDelivery);
  }

  async delete(req, res) {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exist ' });
    }

    if (delivery.signature_id) {
      await File.destroy({
        where: {
          id: delivery.signature_id,
        },
      });
    }

    await Delivery.destroy({
      where: {
        id: req.params.id,
      },
    });
    return res.send();
  }
}

export default new DeliveryController();
