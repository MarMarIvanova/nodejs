import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/library';

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 2000;

export async function connect(): Promise<void> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            await mongoose.connect(MONGO_URI);
            console.log('MongoDB connected');
            return;
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(`MongoDB connection error (attempt ${attempt}/${MAX_RETRIES}):`, message);
            if (attempt === MAX_RETRIES) throw err;
            await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
    }
}

export { mongoose };
