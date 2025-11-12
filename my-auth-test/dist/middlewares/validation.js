import { z } from 'zod';
const exampleSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
});
export async function validateExample(req, res, next) {
    try {
        await exampleSchema.parseAsync(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            error: {
                message: 'Dados inválidos',
                details: error?.errors || []
            }
        });
    }
}
//# sourceMappingURL=validation.js.map