import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';

import Recipient from '../models/Recipient';
import Queue from '../../lib/Queue';
import CreatingDeliveryMail from '../jobs/CreatingDeliveryMail';

class DeliveryController {
  async index(req, res) {
    const deliveries = await Delivery.findAll();
    return res.json(deliveries);
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

    await Delivery.destroy({
      where: {
        id: req.params.id,
      },
    });
    return res.send();
  }
}

export default new DeliveryController();
