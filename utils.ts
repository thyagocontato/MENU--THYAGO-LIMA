
/**
 * Formata uma data no formato YYYY-MM-DD para DD/MM/YYYY sem problemas de fuso horário.
 */
export const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

/**
 * Cria um objeto Date local a partir de uma string YYYY-MM-DD.
 */
export const getLocalDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date(dateStr);
  const [year, month, day] = parts;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};
