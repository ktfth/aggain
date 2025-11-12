import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { exampleRouter } from './routes/example.js';
import { adminRouter } from './admin/index.js';
import { errorHandler } from './middlewares/error.js';
import { logger } from './utils/logger.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;
// Middlewares
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
// Rotas da API
app.use('/api', exampleRouter);
// Interface administrativa
app.use('/admin', express.static(path.join(__dirname, '../public')));
app.use('/admin/api', adminRouter);
// Error handling
app.use(errorHandler);
app.listen(port, () => {
    logger.info(`Servidor rodando na porta ${port}`);
    logger.info(`Acesse o admin em http://localhost:${port}/admin`);
});
export default app;
//# sourceMappingURL=index.js.map