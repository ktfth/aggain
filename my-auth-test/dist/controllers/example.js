export class ExampleController {
    async getExample(req, res, next) {
        try {
            res.json({ message: 'Exemplo de resposta GET' });
        }
        catch (error) {
            next(error);
        }
    }
    async createExample(req, res, next) {
        try {
            const data = req.body;
            res.status(201).json({
                message: 'Exemplo de resposta POST',
                data
            });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=example.js.map