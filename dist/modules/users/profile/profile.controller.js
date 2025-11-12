import { ProfileService } from './profile.service.js';
import { validateProfile } from './profile.validation.js';
function handleError(err) {
    if (err instanceof Error) {
        return {
            status: err.status || 500,
            message: err.message
        };
    }
    return {
        status: 500,
        message: 'Erro interno do servidor'
    };
}
export class ProfileController {
    static async create(req, res) {
        try {
            const data = req.body;
            await validateProfile(data);
            const result = await ProfileService.create(data);
            res.status(201).json(result);
        }
        catch (err) {
            const error = handleError(err);
            res.status(error.status || 400).json({
                error: error.message || 'Erro ao criar Profile'
            });
        }
    }
    static async getAll(req, res) {
        try {
            const results = await ProfileService.findAll();
            res.json(results);
        }
        catch (err) {
            const error = handleError(err);
            res.status(error.status || 500).json({
                error: error.message || 'Erro ao buscar Profiles'
            });
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const result = await ProfileService.findById(id);
            if (!result) {
                return res.status(404).json({ error: 'Profile não encontrado' });
            }
            res.json(result);
        }
        catch (err) {
            const error = handleError(err);
            res.status(error.status || 500).json({
                error: error.message || 'Erro ao buscar Profile'
            });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            await validateProfile(data);
            const result = await ProfileService.update(id, data);
            if (!result) {
                return res.status(404).json({ error: 'Profile não encontrado' });
            }
            res.json(result);
        }
        catch (err) {
            const error = handleError(err);
            res.status(error.status || 500).json({
                error: error.message || 'Erro ao atualizar Profile'
            });
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await ProfileService.delete(id);
            if (!result) {
                return res.status(404).json({ error: 'Profile não encontrado' });
            }
            res.status(204).send();
        }
        catch (err) {
            const error = handleError(err);
            res.status(error.status || 500).json({
                error: error.message || 'Erro ao deletar Profile'
            });
        }
    }
}
//# sourceMappingURL=profile.controller.js.map