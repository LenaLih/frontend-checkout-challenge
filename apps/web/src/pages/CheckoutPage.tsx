import {
  Button,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { PaymentSection } from '../features/PaymentSection';
import { useCreateQuoteMutation, useGetCheckoutOptionsQuery } from '../shared/api/checkoutApi';
import { useCreateOrderMutation } from '../shared/api/orderApi';
import { useCreatePaymentMutation } from '../shared/api/paymentApi';
import { formatPrice } from '../shared/lib/formatPrice';
import {
  checkoutDefaultValues,
  checkoutSchema,
  type CheckoutFormValues,
} from '../shared/validation/checkoutSchema.ts';

export const CheckoutPage = () => {
  const orderIdempotencyKeyRef = useRef<string | null>(null);

  const paymentIdempotencyKeyRef = useRef<string | null>(null);

  const createdOrderIdRef = useRef<string | null>(null);

  const { data, isLoading, error, refetch } = useGetCheckoutOptionsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [createQuote, { data: quoteData, isLoading: isCreatingQuote, error: quoteError }] =
    useCreateQuoteMutation();

  const [createOrder, { data: orderData, isLoading: isCreatingOrder, error: orderError }] =
    useCreateOrderMutation();

  const [createPayment, { data: paymentData, isLoading: isCreatingPayment, error: paymentError }] =
    useCreatePaymentMutation();

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: checkoutDefaultValues,
  });

  const deliveryMethod = useWatch({
    control,
    name: 'deliveryMethod',
  });

  const pickupPointId = useWatch({
    control,
    name: 'pickupPointId',
  });

  if (isLoading) {
    return <div>Loading checkout...</div>;
  }

  if (error || !data) {
    return <div>Failed to load checkout</div>;
  }

  const { cart, deliveryMethods, paymentMethods } = data.data;

  const selectedDelivery = deliveryMethods.find((method) => method.id === deliveryMethod);

  const handleCreateQuote = async () => {
    const values = getValues();

    if (!values.deliveryMethod) {
      return;
    }

    if (values.deliveryMethod === 'pickup' && !values.pickupPointId) {
      return;
    }

    if (values.deliveryMethod === 'courier' && (!values.city || !values.street || !values.house)) {
      return;
    }

    const delivery =
      values.deliveryMethod === 'pickup'
        ? {
            method: 'pickup' as const,
            pickupPointId: values.pickupPointId!,
          }
        : {
            method: 'courier' as const,
            address: {
              city: values.city!,
              street: values.street!,
              house: values.house!,
              ...(values.apartment
                ? {
                    apartment: values.apartment,
                  }
                : {}),
            },
          };

    try {
      const freshCheckout = await refetch().unwrap();

      await createQuote({
        cartVersion: freshCheckout.data.cart.version,
        delivery,
      }).unwrap();

      orderIdempotencyKeyRef.current = null;

      paymentIdempotencyKeyRef.current = null;

      createdOrderIdRef.current = null;
    } catch (error) {
      console.error('Failed to create quote:', error);
    }
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!quoteData) {
      return;
    }

    try {
      let orderId = createdOrderIdRef.current;

      if (!orderId) {
        if (!orderIdempotencyKeyRef.current) {
          orderIdempotencyKeyRef.current = crypto.randomUUID();
        }

        const orderResponse = await createOrder({
          quoteId: quoteData.data.id,

          customer: {
            name: values.name,
            email: values.email,
            phone: values.phone,
          },

          paymentMethod: values.paymentMethod as 'card' | 'cash_on_delivery',

          idempotencyKey: orderIdempotencyKeyRef.current,
        }).unwrap();

        orderId = orderResponse.data.id;

        createdOrderIdRef.current = orderId;

        orderIdempotencyKeyRef.current = null;
      }

      if (values.paymentMethod === 'cash_on_delivery') {
        createdOrderIdRef.current = null;

        return;
      }

      if (values.paymentMethod === 'card') {
        if (!paymentIdempotencyKeyRef.current) {
          paymentIdempotencyKeyRef.current = crypto.randomUUID();
        }

        await createPayment({
          orderId,

          idempotencyKey: paymentIdempotencyKeyRef.current,
        }).unwrap();

        paymentIdempotencyKeyRef.current = null;

        createdOrderIdRef.current = null;
      }
    } catch (error) {
      console.error('Failed to create order or payment:', error);
    }
  };

  const handleOrderSubmit = () => {
    void handleSubmit(onSubmit)();
  };

  return (
    <Container maxWidth="md">
      <Stack spacing={4}>
        <Typography variant="h3">Оформление заказа</Typography>

        <Stack spacing={1}>
          <Typography variant="h5">Корзина</Typography>

          <Typography>Товаров: {cart.quantity}</Typography>

          <Typography>Сумма товаров: {formatPrice(cart.subtotal, cart.currency)}</Typography>
        </Stack>

        <Stack spacing={2}>
          <Typography variant="h5">Данные покупателя</Typography>

          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Имя"
                fullWidth
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
              />
            )}
          />

          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Телефон"
                placeholder="+996555123456"
                fullWidth
                error={Boolean(errors.phone)}
                helperText={errors.phone?.message}
              />
            )}
          />
        </Stack>

        <Controller
          name="deliveryMethod"
          control={control}
          render={({ field }) => (
            <FormControl error={Boolean(errors.deliveryMethod)}>
              <FormLabel>Способ доставки</FormLabel>

              <RadioGroup {...field}>
                {deliveryMethods.map((method) => {
                  const isFree =
                    method.price === 0 ||
                    (method.freeFrom !== null && cart.subtotal >= method.freeFrom);

                  return (
                    <FormControlLabel
                      key={method.id}
                      value={method.id}
                      control={<Radio />}
                      label={`${method.title} — ${
                        isFree ? 'Бесплатно' : formatPrice(method.price, cart.currency)
                      }`}
                    />
                  );
                })}
              </RadioGroup>

              {errors.deliveryMethod && (
                <Typography color="error" variant="caption">
                  {errors.deliveryMethod.message}
                </Typography>
              )}
            </FormControl>
          )}
        />

        {selectedDelivery?.id === 'pickup' && (
          <Controller
            name="pickupPointId"
            control={control}
            render={({ field }) => (
              <FormControl error={Boolean(errors.pickupPointId)}>
                <FormLabel>Пункт самовывоза</FormLabel>

                <RadioGroup {...field}>
                  {selectedDelivery.pickupPoints.map((point) => (
                    <FormControlLabel
                      key={point.id}
                      value={point.id}
                      control={<Radio />}
                      label={`${point.title} — ${point.address}`}
                    />
                  ))}
                </RadioGroup>

                {errors.pickupPointId && (
                  <Typography color="error" variant="caption">
                    {errors.pickupPointId.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        )}

        {deliveryMethod === 'courier' && (
          <Stack spacing={2}>
            <Typography variant="h6">Адрес доставки</Typography>

            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Город"
                  fullWidth
                  error={Boolean(errors.city)}
                  helperText={errors.city?.message}
                />
              )}
            />

            <Controller
              name="street"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Улица"
                  fullWidth
                  error={Boolean(errors.street)}
                  helperText={errors.street?.message}
                />
              )}
            />

            <Controller
              name="house"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Дом"
                  fullWidth
                  error={Boolean(errors.house)}
                  helperText={errors.house?.message}
                />
              )}
            />

            <Controller
              name="apartment"
              control={control}
              render={({ field }) => <TextField {...field} label="Квартира" fullWidth />}
            />
          </Stack>
        )}

        <Controller
          name="paymentMethod"
          control={control}
          render={({ field }) => (
            <FormControl error={Boolean(errors.paymentMethod)}>
              <FormLabel>Способ оплаты</FormLabel>

              <RadioGroup {...field}>
                {paymentMethods.map((method) => (
                  <FormControlLabel
                    key={method.id}
                    value={method.id}
                    control={<Radio />}
                    label={method.title}
                  />
                ))}
              </RadioGroup>

              {errors.paymentMethod && (
                <Typography color="error" variant="caption">
                  {errors.paymentMethod.message}
                </Typography>
              )}
            </FormControl>
          )}
        />

        <Button
          variant="outlined"
          disabled={
            isCreatingQuote || !deliveryMethod || (deliveryMethod === 'pickup' && !pickupPointId)
          }
          onClick={handleCreateQuote}
        >
          {isCreatingQuote ? 'Рассчитываем...' : 'Рассчитать заказ'}
        </Button>

        {quoteError && <Typography color="error">Не удалось рассчитать заказ</Typography>}

        {quoteData && (
          <Stack spacing={1}>
            <Typography variant="h5">Расчёт заказа</Typography>

            <Typography>
              Товары: {formatPrice(quoteData.data.subtotal, quoteData.data.currency)}
            </Typography>

            <Typography>
              Доставка: {formatPrice(quoteData.data.shipping, quoteData.data.currency)}
            </Typography>

            <Typography variant="h5">
              Итого: {formatPrice(quoteData.data.total, quoteData.data.currency)}
            </Typography>

            <Typography color="text.secondary">
              Расчёт действует до: {new Date(quoteData.data.expiresAt).toLocaleString('ru-RU')}
            </Typography>
          </Stack>
        )}

        {quoteData && !orderData && (
          <Button
            variant="contained"
            disabled={isCreatingOrder || isCreatingPayment}
            onClick={handleOrderSubmit}
          >
            {isCreatingOrder
              ? 'Создаём заказ...'
              : isCreatingPayment
                ? 'Создаём оплату...'
                : 'Оформить заказ'}
          </Button>
        )}

        {orderError && <Typography color="error">Не удалось создать заказ</Typography>}

        {paymentError && <Typography color="error">Не удалось создать попытку оплаты</Typography>}

        {orderData && (
          <Stack spacing={1}>
            <Typography variant="h5" color="success.main">
              Заказ создан
            </Typography>

            <Typography>Номер: {orderData.data.number}</Typography>

            <Typography>Статус: {orderData.data.status}</Typography>

            <Typography>Статус оплаты: {orderData.data.paymentStatus}</Typography>
          </Stack>
        )}

        {paymentData && <PaymentSection paymentId={paymentData.data.id} />}

        <Link to="/cart">
          <Button variant="outlined">Назад в корзину</Button>
        </Link>
      </Stack>
    </Container>
  );
};
