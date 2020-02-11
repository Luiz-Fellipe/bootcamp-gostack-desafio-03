import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    const deliverymen = await Deliveryman.findAll({
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['url', 'name', 'path'],
        },
      ],
    });
    return res.json(deliverymen);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const deliveryExist = await Deliveryman.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (deliveryExist) {
      return res.status(400).json('Delivery already exist');
    }

    const newDeliveryman = await Deliveryman.create(req.body);

    return res.status(201).json(newDeliveryman);
  }

  async show(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['url', 'name', 'path'],
        },
      ],
    });
    if (!deliveryman) {
      return res.status(400).json({ error: "deliveryman don't exist" });
    }
    return res.json(deliveryman);
  }

  async update(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id);
    if (!deliveryman) {
      return res.status(400).json({ error: "deliveryman don't exist" });
    }

    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    // verificando se o email ja não existe
    if (req.body.email && deliveryman.email !== req.body.email) {
      const deliveryExist = await Deliveryman.findOne({
        where: {
          email: req.body.email,
        },
      });
      if (deliveryExist) {
        return res.status(400).json('Deliveryman already exist');
      }
    }

    const newDeliveryman = await deliveryman.update(req.body);

    return res.json(newDeliveryman);
  }

  async delete(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id);
    if (!deliveryman) {
      return res.status(400).json({ error: "deliveryman don't exist" });
    }

    await Deliveryman.destroy({
      where: {
        id: req.params.id,
      },
    });

    return res.send();
  }
}

export default new DeliverymanController();
