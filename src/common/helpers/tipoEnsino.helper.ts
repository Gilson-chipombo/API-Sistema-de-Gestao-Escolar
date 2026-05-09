import { TipoEnsino } from '@prisma/client';

/**
 * Calcula o tipo de ensino baseado na classe/série
 * @param classe String como "7ª", "9ª", "10ª", "11ª", "12ª"
 * @returns TipoEnsino (SECUNDARIO ou MEDIO)
 */
export function calcularTipoEnsino(classe: string): TipoEnsino {
  // Extrair o número da classe
  const match = classe.match(/(\d+)/);
  if (!match) {
    // Se não conseguir extrair, padrão é SECUNDARIO
    return TipoEnsino.SECUNDARIO;
  }

  const numero = parseInt(match[1], 10);
  
  // Secundário: 1º a 9º
  // Médio: 10º, 11º, 12º
  return numero > 9 ? TipoEnsino.MEDIO : TipoEnsino.SECUNDARIO;
}
