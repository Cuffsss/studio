
import fs from 'fs/promises';
import path from 'path';
import type { UserData, Person, SleepLog } from './types';

// The path to the JSON file that will act as our database
const DB_PATH = path.join(process.cwd(), 'db.json');

type Database = {
  [email: string]: {
    passwordHash: string;
    people: Person[];
    logs: SleepLog[];
  };
};

// Ensures the database file exists.
async function ensureDb(): Promise<void> {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify({}));
  }
}

// Reads the entire database from the file.
export async function readDb(): Promise<Database> {
  await ensureDb();
  const fileContent = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(fileContent) as Database;
}

// Writes the entire database to the file.
async function writeDb(db: Database): Promise<void> {
  await ensureDb();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

// Finds a user by their email address.
export async function findUserByEmail(email: string) {
  const db = await readDb();
  return db[email] ? { email, ...db[email] } : null;
}

// Creates a new user in the database.
export async function createUser(email: string, passwordHash: string) {
  const db = await readDb();
  if (db[email]) {
    throw new Error('User already exists');
  }
  db[email] = {
    passwordHash,
    people: [],
    logs: [],
  };
  await writeDb(db);
  return { email, ...db[email] };
}

// Gets all data for a specific user.
export async function getUserData(email: string): Promise<UserData | null> {
    const userRecord = await findUserByEmail(email);
    if (!userRecord) {
        return null;
    }
    return {
        user: { email: userRecord.email },
        people: userRecord.people,
        logs: userRecord.logs.map(log => ({ ...log, timestamp: new Date(log.timestamp) })), // Re-hydrate dates
    };
}

// Updates data for a specific user.
export async function updateUserData(email: string, data: Partial<Omit<UserData, 'user'>>): Promise<void> {
    const db = await readDb();
    if (!db[email]) {
        throw new Error('User not found');
    }
    if (data.people) {
        db[email].people = data.people;
    }
    if (data.logs) {
        db[email].logs = data.logs;
    }
    await writeDb(db);
}
