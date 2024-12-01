export const convertAmount = (value: string): number => {
  const cleanValue = value.toString().toLowerCase().trim();
  
  if (cleanValue.endsWith('k')) {
    return parseFloat(cleanValue.slice(0, -1)) * 1000;
  }
  
  if (cleanValue.endsWith('m')) {
    return parseFloat(cleanValue.slice(0, -1)) * 1000000;
  }
  
  if (cleanValue.endsWith('b')) {
    return parseFloat(cleanValue.slice(0, -1)) * 1000000000;
  }
  
  return parseFloat(cleanValue) || 0;
}; 