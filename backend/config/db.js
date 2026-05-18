import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('DB CONNECTED'))
        .catch((err) => {
            console.error('DB CONNECTION FAILED:', err.message);
            process.exit(1);
        });
};
