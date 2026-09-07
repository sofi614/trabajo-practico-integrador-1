import express from 'express';
import "dotenv/config"
import { connectDB } from './src/config/database.js';

const app = express();
const PORT = process.env.PORT || 3000 ;

const startServer = async () => {
    await connectDB();

    app.listen(PORT , () => {
        console.log('servidor corriendo en el puerto 3000');
    });
};

startServer();

export default app;