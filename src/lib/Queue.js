import Bee from 'bee-queue';
import CreatingDeliveryMail from '../app/jobs/CreatingDeliveryMail';
import redisConfig from '../config/redis';

const jobs = [CreatingDeliveryMail];

// Configuração da fila
class Queue {
  constructor() {
    // variável queues armazena as filas, porém cada job tem sua fila
    this.queues = {};

    this.init();
  }

  /**
   * init() inicia a fila do job.
   */
  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  /**
   * add() adiciona novos jobs dentro de uma fila
   * recebe como parametro a fila 'queue' | e os dados do 'job'
   */
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  /**
   * processQueue() processa as filas, em tempo real
   * ou seja, sempre que entra um novo job esse método o processa.
   */
  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      // on() ouve o evento em caso de falha e invoca o método handleFailure()
      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
