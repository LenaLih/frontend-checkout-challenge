import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';

import { useGetPaymentQuery } from '../shared/api/paymentApi.ts';
import { useCreateSimulationMutation, useGetSandboxQuery } from '../shared/api/sandboxApi';
import { formatPrice } from '../shared/lib/formatPrice.ts';

type PaymentSectionProps = {
  paymentId: string;
};

export const PaymentSection = ({ paymentId }: PaymentSectionProps) => {
  const {
    data: sandboxData,
    isLoading: isSandboxLoading,
    error: sandboxError,
  } = useGetSandboxQuery();

  const [
    createSimulation,
    { data: simulationData, isLoading: isCreatingSimulation, error: simulationError },
  ] = useCreateSimulationMutation();

  const {
    data: paymentData,
    isLoading: isPaymentLoading,
    error: paymentError,
    refetch,
  } = useGetPaymentQuery(paymentId);

  const payment = paymentData?.data;

  useEffect(() => {
    if (payment?.status !== 'pending') {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refetch();
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [payment?.status, refetch]);

  const handleSimulation = async (scenario: 'success' | 'decline') => {
    try {
      await createSimulation({
        paymentId,
        scenario,
      }).unwrap();

      await refetch();
    } catch (error) {
      console.error('Failed to create simulation:', error);
    }
  };

  if (isPaymentLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={20} />

        <Typography>Проверяем статус оплаты...</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Оплата</Typography>

      {payment && (
        <Stack spacing={1}>
          <Typography>Статус: {payment.status}</Typography>

          <Typography>Сумма: {formatPrice(payment.amount, payment.currency)}</Typography>

          {payment.failureCode && (
            <Typography color="error">Ошибка: {payment.failureCode}</Typography>
          )}
        </Stack>
      )}

      {payment?.status === 'pending' && (
        <Stack spacing={2}>
          <Typography variant="h6">Выберите тестовую карту</Typography>

          {isSandboxLoading && <Typography>Загружаем тестовые карты...</Typography>}

          {sandboxError && (
            <Typography color="error">Не удалось загрузить тестовые карты</Typography>
          )}

          {sandboxData?.data.cards.map((card) => (
            <Button
              key={card.id}
              variant="outlined"
              disabled={isCreatingSimulation}
              onClick={() => handleSimulation(card.scenario)}
            >
              {card.title} — {card.maskedNumber}
            </Button>
          ))}
        </Stack>
      )}

      {isCreatingSimulation && <Typography>Обрабатываем тестовую оплату...</Typography>}

      {simulationData && (
        <Typography color="text.secondary">Имитация: {simulationData.data.status}</Typography>
      )}

      {simulationError && (
        <Typography color="error">Не удалось запустить тестовую оплату</Typography>
      )}

      {paymentError && <Typography color="error">Не удалось получить статус оплаты</Typography>}

      {payment?.status === 'succeeded' && (
        <Typography variant="h5" color="success.main">
          Оплата успешно завершена
        </Typography>
      )}

      {payment?.status === 'failed' && (
        <Typography variant="h5" color="error">
          Оплата отклонена
        </Typography>
      )}

      {payment?.status === 'cancelled' && <Typography color="error">Оплата отменена</Typography>}
    </Stack>
  );
};
