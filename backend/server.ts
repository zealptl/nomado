import express from 'express';
import sharedRouter from './routes/shared';
import tripsRouter from './routes/trips';
import itemsRouter from './routes/items';
import segmentsRouter from './routes/segments';
import tagsRouter from './routes/tags';
import inviteRouter from './routes/invite';

const app = express();
app.use(express.json());
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// shared must be mounted before trips to prevent /shared being captured as /:id
app.use('/api/trips', sharedRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/trips', itemsRouter);
app.use('/api/trips', segmentsRouter);
app.use('/api/trips', tagsRouter);
app.use('/api', inviteRouter);

if (require.main === module) {
  app.listen(3001, () => {
    console.log('Backend running on http://localhost:3001');
  });
}

export default app;
