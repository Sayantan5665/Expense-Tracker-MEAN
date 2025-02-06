import Agenda, { Job } from 'agenda';
import dotenv from "dotenv";
dotenv.config();

// MongoDB connection
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASS = process.env.MONGO_PASS;
const MONGO_NAME = process.env.MONGO_NAME;
const mongodb_uri: string = 'mongodb+srv://' + MONGO_USER + ':' + MONGO_PASS + '@cluster0.wmkkeag.mongodb.net/' + MONGO_NAME;

const agenda = new Agenda({
  db: { address: mongodb_uri, collection: 'agendaJobs' }
});

// Define job types
agenda.define('sendDailyReport', async (job: Job) => {
  const { userId } = job.attrs.data;
  try {
    // await sendDailyExpenseReport(userId);
  } catch (error) {
    console.error('Error sending daily report:', error);
  }
});

agenda.define('sendMonthlyReport', async (job: Job) => {
  const { userId } = job.attrs.data;
  try {
    // await sendMonthlyExpenseReport(userId);
  } catch (error) {
    console.error('Error sending monthly report:', error);
  }
});

export { agenda };