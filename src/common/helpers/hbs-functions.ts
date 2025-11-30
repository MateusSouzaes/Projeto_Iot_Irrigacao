export const helpers = {
  dateFormat: (date: string) => {
    const locale = new Date(date);
    return locale.toLocaleString('pt-BR');
  },
  inc: (value: string) => parseInt(value) + 1,
  json: (context) => JSON.stringify(context, null, 2),
  'selected-option': (id: any, compareId: any, oldId?: any) => {
    if (oldId) return id == oldId ? 'selected' : '';
    return id == compareId ? 'selected' : '';
  },
  isString: (value) => typeof value === 'string',
  year: () => new Date().getFullYear(),

  ifEquals: (a: any, b: any) => a == b,
  includes: (item: any, array: any[]) => Array.isArray(array) && array.includes(item),

  range: (start: number, end: number): number[] => {
  const arr: number[] = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
},

  dec: (value: number) => value - 1,
};
