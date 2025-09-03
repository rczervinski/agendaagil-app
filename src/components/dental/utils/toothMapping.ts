/**
 * Mapeamento entre numeração Universal (1-32) e FDI
 * 
 * Universal System (1-32):
 * - Usado principalmente nos EUA
 * - Conta de 1 a 32, começando do terceiro molar superior direito
 * 
 * FDI System (International):
 * - Sistema mundial padrão
 * - Primeiro dígito = quadrante, segundo = posição no quadrante
 * - Quadrantes: 1=superior direito, 2=superior esquerdo, 3=inferior esquerdo, 4=inferior direito
 */

// Mapeamento Universal → FDI
export const UNIVERSAL_TO_FDI: Record<number, string> = {
  // Maxilar Superior Direito (Quadrante 1)
  1: "18",  // Terceiro molar superior direito
  2: "17",  // Segundo molar superior direito
  3: "16",  // Primeiro molar superior direito
  4: "15",  // Segundo pré-molar superior direito
  5: "14",  // Primeiro pré-molar superior direito
  6: "13",  // Canino superior direito
  7: "12",  // Incisivo lateral superior direito
  8: "11",  // Incisivo central superior direito
  
  // Maxilar Superior Esquerdo (Quadrante 2)
  9: "21",   // Incisivo central superior esquerdo
  10: "22",  // Incisivo lateral superior esquerdo
  11: "23",  // Canino superior esquerdo
  12: "24",  // Primeiro pré-molar superior esquerdo
  13: "25",  // Segundo pré-molar superior esquerdo
  14: "26",  // Primeiro molar superior esquerdo
  15: "27",  // Segundo molar superior esquerdo
  16: "28",  // Terceiro molar superior esquerdo
  
  // Maxilar Inferior Esquerdo (Quadrante 3)
  17: "38",  // Terceiro molar inferior esquerdo
  18: "37",  // Segundo molar inferior esquerdo
  19: "36",  // Primeiro molar inferior esquerdo
  20: "35",  // Segundo pré-molar inferior esquerdo
  21: "34",  // Primeiro pré-molar inferior esquerdo
  22: "33",  // Canino inferior esquerdo
  23: "32",  // Incisivo lateral inferior esquerdo
  24: "31",  // Incisivo central inferior esquerdo
  
  // Maxilar Inferior Direito (Quadrante 4)
  25: "41",  // Incisivo central inferior direito
  26: "42",  // Incisivo lateral inferior direito
  27: "43",  // Canino inferior direito
  28: "44",  // Primeiro pré-molar inferior direito
  29: "45",  // Segundo pré-molar inferior direito
  30: "46",  // Primeiro molar inferior direito
  31: "47",  // Segundo molar inferior direito
  32: "48",  // Terceiro molar inferior direito
}

// Mapeamento reverso FDI → Universal
export const FDI_TO_UNIVERSAL: Record<string, number> = {
  // Criar mapeamento reverso
  ...Object.fromEntries(
    Object.entries(UNIVERSAL_TO_FDI).map(([universal, fdi]) => [fdi, parseInt(universal)])
  )
}

// Nomes dos dentes em português
export const TOOTH_NAMES: Record<number, string> = {
  1: "Terceiro molar superior direito",
  2: "Segundo molar superior direito", 
  3: "Primeiro molar superior direito",
  4: "Segundo pré-molar superior direito",
  5: "Primeiro pré-molar superior direito",
  6: "Canino superior direito",
  7: "Incisivo lateral superior direito", 
  8: "Incisivo central superior direito",
  9: "Incisivo central superior esquerdo",
  10: "Incisivo lateral superior esquerdo",
  11: "Canino superior esquerdo",
  12: "Primeiro pré-molar superior esquerdo",
  13: "Segundo pré-molar superior esquerdo", 
  14: "Primeiro molar superior esquerdo",
  15: "Segundo molar superior esquerdo",
  16: "Terceiro molar superior esquerdo",
  17: "Terceiro molar inferior esquerdo",
  18: "Segundo molar inferior esquerdo",
  19: "Primeiro molar inferior esquerdo", 
  20: "Segundo pré-molar inferior esquerdo",
  21: "Primeiro pré-molar inferior esquerdo",
  22: "Canino inferior esquerdo",
  23: "Incisivo lateral inferior esquerdo",
  24: "Incisivo central inferior esquerdo",
  25: "Incisivo central inferior direito",
  26: "Incisivo lateral inferior direito",
  27: "Canino inferior direito",
  28: "Primeiro pré-molar inferior direito",
  29: "Segundo pré-molar inferior direito",
  30: "Primeiro molar inferior direito",
  31: "Segundo molar inferior direito", 
  32: "Terceiro molar inferior direito",
}

// Função para converter Universal para FDI
export function universalToFDI(universalNumber: number): string {
  return UNIVERSAL_TO_FDI[universalNumber] || "";
}

// Função para converter FDI para Universal
export function fdiToUniversal(fdiNumber: string): number {
  return FDI_TO_UNIVERSAL[fdiNumber] || 0;
}

// Função para obter nome do dente
export function getToothName(universalNumber: number): string {
  return TOOTH_NAMES[universalNumber] || `Dente ${universalNumber}`;
}

// Função para validar numeração Universal
export function isValidUniversalNumber(num: number): boolean {
  return num >= 1 && num <= 32;
}

// Função para validar numeração FDI
export function isValidFDINumber(fdiNum: string): boolean {
  return Object.values(UNIVERSAL_TO_FDI).includes(fdiNum);
}

// Função para obter SVG path do dente
export function getToothSVGPath(universalNumber: number): string {
  return `/dental-icons/${universalNumber}.svg`;
}

// Função para determinar quadrante do dente
export function getToothQuadrant(universalNumber: number): string {
  if (universalNumber >= 1 && universalNumber <= 8) return "superior-direito";
  if (universalNumber >= 9 && universalNumber <= 16) return "superior-esquerdo";
  if (universalNumber >= 17 && universalNumber <= 24) return "inferior-esquerdo";
  if (universalNumber >= 25 && universalNumber <= 32) return "inferior-direito";
  return "";
}