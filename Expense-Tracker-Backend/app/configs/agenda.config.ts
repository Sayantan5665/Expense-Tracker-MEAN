import Agenda, { Job } from 'agenda';
import dotenv from "dotenv";
import { sendDailyMonthlyExpenseReport } from '../utils';
import { IUser } from '../interfaces';
import userRepositories from '../modules/user.module/repositories/user.repositories';
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

// Function to start agenda and recover existing jobs
const startAgenda = async () => {
  // Start Agenda
  await agenda.start();

  // Find all active users and ensure they have scheduled reports
  const activeUsers: Array<IUser> = await userRepositories.fetchAllUsers({ isActive: true });

  for (const user of activeUsers) {
    // Check if jobs already exist for this user
    const existingDailyJobs = await agenda.jobs({
      name: 'sendDailyReport',
      'data.userId': user._id.toString()
    });

    const existingMonthlyJobs = await agenda.jobs({
      name: 'sendMonthlyReport',
      'data.userId': user._id.toString()
    });

    // Schedule daily report if not exists
    if (existingDailyJobs.length === 0) {
      await agenda.every('0 20 * * *', 'sendDailyReport', { userId: user._id });
    }

    // Schedule monthly report if not exists
    if (existingMonthlyJobs.length === 0) {
      await agenda.every('0 9 1 * *', 'sendMonthlyReport', { userId: user._id });
    }
  }

  console.log('Agenda started and jobs recovered');
};

export { agenda, startAgenda };