import * as Yup from 'yup';
import { Op } from 'sequelize';
import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const LIMIT_PER_PAGE = 5;
    const { page = 1, name } = req.query;

    const response = await Recipient.findAndCountAll({
      order: [['id', 'DESC']],
      where: {
        name: name
          ? {
              [Op.like]: `%${name}%`,
            }
          : {
              [Op.ne]: null,
            },
      },
      limit: LIMIT_PER_PAGE,
      offset: (page - 1) * LIMIT_PER_PAGE,
    });

    const recipients = {
      recipients: response.rows,
      totalPages: Math.ceil(response.count / LIMIT_PER_PAGE),
    };

    return res.json(recipients);
  }

  async show(req, res) {
    const recipient = await Recipient.findByPk(req.params.id, {
      attributes: [
        'id',
        'name',
        'street',
        'complement',
        'uf',
        'number',
        'city',
        'zip_code',
      ],
    });
    if (!recipient) {
      return res.status(400).json({ error: "recipient don't exist" });
    }
    return res.json(recipient);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      complement: Yup.string().required(),
      number: Yup.string(),
      zip_code: Yup.string().required(),
      uf: Yup.string()
        .required()
        .max(2),
      city: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }
    const newRecipient = await Recipient.create(req.body);

    return res.status(201).json(newRecipient);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      zip_code: Yup.string(),
      // se o usuário mudar o cep, ele é obrigado a informar a rua.
      street: Yup.string().when('zip_code', (zip_code, field) =>
        zip_code ? field.required() : field
      ),
      complement: Yup.string(),
      number: Yup.string(),
      uf: Yup.string().max(2),
      // se o usuário mudar a uf ele é obrigado a informar a cidade.
      city: Yup.string().when('uf', (uf, field) =>
        uf ? field.required() : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exist.' });
    }

    const newRecipient = await recipient.update(req.body);

    return res.status(200).json(newRecipient);
  }

  async delete(req, res) {
    const recipient = await Recipient.findByPk(req.params.id);
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exist ' });
    }

    await Recipient.destroy({
      where: {
        id: req.params.id,
      },
    });
    return res.send();
  }
}

export default new RecipientController();
