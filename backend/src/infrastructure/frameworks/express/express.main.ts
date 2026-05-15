import { createExpressApp } from './ExpressApp';

const PORT = 3001;

const app = createExpressApp();

app.listen(PORT, () => {
  console.log(`🚀 Serveur Express démarré sur http://localhost:${PORT}`);
  console.log(`   Mêmes Use Cases que NestJS, framework différent.`);
  console.log('');
  console.log('   Routes disponibles :');
  console.log('   POST /couriers/deliveries');
  console.log('   POST /couriers/deliveries/:id/complete');
  console.log('   GET  /messages/private?userIdA=&userIdB=');
  console.log('   GET  /messages/group?roomId=');
});
