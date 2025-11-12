export async function validateProfile(data: any) {
  if (!data) {
    throw { status: 400, message: 'Dados não fornecidos' };
  }

  if (!data.bio) {
    throw { status: 400, message: 'bio é obrigatório' };
  }

  return true;
}