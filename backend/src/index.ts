import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.routes';
import entityRoutes from './routes/entities.routes';
import approvalRoutes from './routes/approvals.routes';
import alertRoutes from './routes/alerts.routes';
import reportRoutes from './routes/reports.routes';
import epicUploadRoutes from './routes/epicUpload.routes';
import vahanValidationRoutes from './routes/vahanValidation.routes';
import auditLogRoutes from './routes/auditLog.routes';
import tyreRotationRoutes from './routes/tyreRotation.routes';
import { notFoundHandler, errorHandler, requestLogger } from './middleware/errorHandler';
import { openapiSpec } from './swagger';
import { evaluateAlerts } from './services/alertsEngine';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '5mb' }));
  app.use(requestLogger);

  app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
  app.get('/openapi.json', (_req, res) => res.json(openapiSpec));

  app.use('/api/auth', authRoutes);
  app.use('/api/approvals', approvalRoutes);
  app.use('/api/alerts', alertRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/epic-upload', epicUploadRoutes);
  app.use('/api/vahan-validation', vahanValidationRoutes);
  app.use('/api/audit-log', auditLogRoutes);
  app.use('/api', tyreRotationRoutes);
  app.use('/api', entityRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = parseInt(process.env.PORT || '4000', 10);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Fleet Management backend listening on port ${port}`);
    // eslint-disable-next-line no-console
    console.log(`Swagger UI: http://localhost:${port}/api-docs`);
  });

  // Run the alerts engine every hour. Best-effort: log and continue on failure.
  cron.schedule('0 * * * *', async () => {
    try {
      const result = await evaluateAlerts();
      // eslint-disable-next-line no-console
      console.log('Alerts engine run:', result);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Alerts engine run failed:', err);
    }
  });
}
