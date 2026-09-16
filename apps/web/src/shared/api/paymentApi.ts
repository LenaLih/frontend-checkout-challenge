import { baseApi } from './baseApi';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'cancelled';

export type Payment = {
  id: string;
  orderId: string;
  status: PaymentStatus;
  amount: number;
  currency: 'RUB';
  createdAt: string;
  failureCode?: string | null;
};

type PaymentResponse = {
  data: Payment;
};

type CreatePaymentRequest = {
  orderId: string;
  idempotencyKey: string;
};

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPayment: builder.mutation<PaymentResponse, CreatePaymentRequest>({
      query: ({ orderId, idempotencyKey }) => ({
        url: `/api/orders/${orderId}/payments`,
        method: 'POST',

        headers: {
          'idempotency-key': idempotencyKey,
        },

        body: {},
      }),
    }),

    getPayment: builder.query<PaymentResponse, string>({
      query: (paymentId) => `/api/payments/${paymentId}`,
    }),
  }),
});

export const { useCreatePaymentMutation, useGetPaymentQuery } = paymentApi;
