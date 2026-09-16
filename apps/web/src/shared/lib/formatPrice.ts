export const formatPrice = (value: number, currency = 'RUB') => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
  }).format(value / 100);
};
