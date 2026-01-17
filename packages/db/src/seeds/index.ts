import { seedLeads } from './leads.seed';
import { seedPersons } from './persons.seed';
import { seedSyncJobLeads } from './sync-job-leads.seed';
import { seedSyncJobs } from './sync-jobs.seed';

const seed = async () => {
  await seedPersons();
  await seedLeads();
  await seedSyncJobs();
  await seedSyncJobLeads();
};

seed()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
