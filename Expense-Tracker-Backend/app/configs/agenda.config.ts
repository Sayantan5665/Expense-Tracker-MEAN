import Agenda, { Job } from 'agenda';
import dotenv from "dotenv";
import { sendDailyMonthlyExpenseReport } from '../utils';
dotenv.config();

// MongoDB connection
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASS = process.env.MONGO_PASS;
const MONGO_NAME = process.env.MONGO_NAME;
const mongodb_uri: string = 'mongodb+srv://' + MONGO_USER + ':' + MONGO_PASS + '@cluster0.wmkkeag.mongodb.net/' + MONGO_NAME;
const BASE_PATH: string = process.env.BASE_PATH || 'http://localhost:5503';

const agenda = new Agenda({
  db: { address: mongodb_uri, collection: 'agendaJobs' }
});

// Define job types
agenda.define('sendDailyReport', async (job: Job) => {
  const { userId } = job.attrs.data;
  try {
    sendDailyMonthlyExpenseReport(userId, BASE_PATH, 'daily');
  } catch (error) {
    console.error('Error sending daily report:', error);
  }
});

agenda.define('sendMonthlyReport', async (job: Job) => {
  const { userId } = job.attrs.data;
  try {
    sendDailyMonthlyExpenseReport(userId, BASE_PATH, 'monthly');
  } catch (error) {
    console.error('Error sending monthly report:', error);
  }
});

export { agenda };