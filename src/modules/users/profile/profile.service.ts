import { ProfileModel } from './profile.model.js';
import { logger } from '../../../utils/logger.js';

export class ProfileService {
  static async create(data: any) {
    try {
      return await ProfileModel.create(data);
    } catch (error) {
      logger.error('Erro ao criar Profile:', error);
      throw error;
    }
  }

  static async findAll() {
    try {
      return await ProfileModel.find();
    } catch (error) {
      logger.error('Erro ao buscar Profiles:', error);
      throw error;
    }
  }

  static async findById(id: string) {
    try {
      return await ProfileModel.findById(id);
    } catch (error) {
      logger.error('Erro ao buscar Profile:', error);
      throw error;
    }
  }

  static async update(id: string, data: any) {
    try {
      return await ProfileModel.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      logger.error('Erro ao atualizar Profile:', error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      return await ProfileModel.findByIdAndDelete(id);
    } catch (error) {
      logger.error('Erro ao deletar Profile:', error);
      throw error;
    }
  }
}