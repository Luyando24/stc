import { Router } from 'express';
import healthCheck from './health-check.js';
import trackingRouter from './tracking.js';
import maerskRouter from './maersk.js';
import maerskTrackRouter from './maersk-track.js';
import cmaRouter from './cma.js';
import mscRouter from './msc.js';
import evergreenRouter from './evergreen.js';
import ooclRouter from './oocl.js';
import coscoRouter from './cosco.js';
import hapagRouter from './hapag.js';
import zimRouter from './zim.js';
import oneRouter from './one.js';
import autoRouter from './auto.js';
import procurementRouter from './procurement.js';
import adminRouter from './admin.js';

const router = Router();

export default () => {
  router.get('/health', healthCheck);
  router.use('/track', trackingRouter);
  router.use('/maersk', maerskRouter);
  router.use('/maersk', maerskTrackRouter);
  router.use('/cma', cmaRouter);
  router.use('/msc', mscRouter);
  router.use('/evergreen', evergreenRouter);
  router.use('/oocl', ooclRouter);
  router.use('/cosco', coscoRouter);
  router.use('/hapag', hapagRouter);
  router.use('/zim', zimRouter);
  router.use('/one', oneRouter);
  router.use('/auto', autoRouter);
  router.use('/procurement', procurementRouter);
  router.use('/admin', adminRouter);

  return router;
};