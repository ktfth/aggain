import express from 'express';
import { generateComponent } from './templates/index.js';
import { logger } from '../utils/logger.js';
const router = express.Router();
// Listar tipos de componentes
router.get('/components/types', (req, res) => {
    const types = [
        {
            id: 'route',
            name: 'Rota',
            description: 'Gera uma nova rota com CRUD básico'
        },
        {
            id: 'controller',
            name: 'Controlador',
            description: 'Gera um novo controlador com métodos CRUD'
        },
        {
            id: 'service',
            name: 'Serviço',
            description: 'Gera uma nova camada de serviço com operações básicas'
        },
        {
            id: 'middleware',
            name: 'Middleware',
            description: 'Gera um novo middleware com template básico'
        },
        {
            id: 'model',
            name: 'Modelo',
            description: 'Gera um novo modelo com schema Zod'
        }
    ];
    res.json(types);
});
// Gerar novo componente
router.post('/components', async (req, res) => {
    try {
        const { name, type } = req.body;
        if (!name || !type) {
            return res.status(400).json({
                error: 'Nome e tipo são obrigatórios'
            });
        }
        await generateComponent({
            name,
            type,
            framework: 'express',
            baseDir: process.cwd(),
            includeTests: true
        });
        res.status(201).json({
            message: `Componente ${name} do tipo ${type} gerado com sucesso!`
        });
    }
    catch (error) {
        logger.error({ error }, 'Erro ao gerar componente');
        res.status(500).json({
            error: 'Erro ao gerar componente',
            details: error.message
        });
    }
});
// Listar componentes existentes
router.get('/components', async (req, res) => {
    try {
        const { type } = req.query;
        const baseDir = process.cwd();
        const componentDir = type
            ? path.join(baseDir, 'src', `${type}s`)
            : path.join(baseDir, 'src');
        const files = await readdir(componentDir, { withFileTypes: true });
        const components = files
            .filter(file => file.isFile() && file.name.endsWith('.ts'))
            .map(file => ({
            name: file.name.replace('.ts', ''),
            type: type || path.basename(path.dirname(path.join(componentDir, file.name))),
            path: path.join(path.relative(baseDir, componentDir), file.name)
        }));
        res.json(components);
    }
    catch (error) {
        logger.error({ error }, 'Erro ao listar componentes');
        res.status(500).json({
            error: 'Erro ao listar componentes',
            details: error.message
        });
    }
});
export const adminRouter = router;
//# sourceMappingURL=index.js.map