import './config/env';
import { connectDB } from './config/database';
import { env } from './config/env';
import app from './app';

const levantarServidor = async () => {
    await connectDB();

    app.listen(env.PORT, () => {
        const serverUrl = env.BACKEND_URL || `http://localhost:${env.PORT}`;
        console.log(`\nComoEnCasa API`);
        console.log(`Server running on port ${env.PORT}`);
        console.log(`Environment: ${env.NODE_ENV}`);
        console.log(`Health: ${serverUrl}/api/health`);
        console.log('');
    });
};

levantarServidor().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
