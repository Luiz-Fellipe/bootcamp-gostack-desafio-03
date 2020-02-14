import {
  startOfDay,
  endOfDay,
  isBefore,
  isAfter,
  setSeconds,
  setMinutes,
  setHours,
} from 'date-fns';
import { Op } from 'sequelize';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';

class StartDeliveryController {
  async update(req, res) {
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
        start_date: null,
        end_date: null,
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
        error: 'delivery does not exist or has started ',
      });
    }

    // pega a data atual
    const date = new Date();

    const initHoursWithdrawal = setSeconds(setMinutes(setHours(date, 8), 0), 0);
    const endHoursWithdrawal = setSeconds(setMinutes(setHours(date, 18), 0), 0);

    if (
      !(
        isAfter(date, initHoursWithdrawal) && isBefore(date, endHoursWithdrawal)
      )
    ) {
      return res.status(400).json({
        error: 'you can only pick up your order between 8 am and 6 pm',
      });
    }

    // armazena a quantidade de encomendas que o entregador ja retirou hoje
    const { count: countDeliveriesDay } = await Delivery.findAndCountAll({
      where: {
        deliveryman_id: deliverymanId,
        canceled_at: null,
        start_date: {
          [Op.between]: [startOfDay(date), endOfDay(date)],
        },
      },
    });

    if (countDeliveriesDay >= 5) {
      return res
        .status(400)
        .json({ error: 'you already made 5 withdrawals today' });
    }

    const startedDelivery = await delivery.update({
      start_date: new Date(),
    });

    return res.json(startedDelivery);
  }
}

export default new StartDeliveryController();
