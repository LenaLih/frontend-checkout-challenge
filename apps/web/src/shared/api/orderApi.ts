import { baseApi } from './baseApi';
import type { CartItem } from './cartApi';
import type { QuoteDelivery } from './checkoutApi';

export type Customer = {
  name: string;
  email: string;
  phone: string;
};

export type PaymentMethod = 'card' | 'cash_on_delivery';

export type CreateOrderRequest = {
  quoteId: string;
  customer: Customer;
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
};

export type Order = {
  id: string;
  number: string;
  status: string;
  paymentStatus: string;
  paymentMethod: PaymentMethod;
  customer: Customer;
  items: CartItem[];
  delivery: QuoteDelivery;
  subtotal: number;
  shipping: number;
  total: number;
  currency: 'RUB';
  createdAt: string;
};

type OrderResponse = {
  data: Order;
};

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<OrderResponse, CreateOrderRequest>({
      query: ({ idempotencyKey, ...body }) => ({
        url: '/api/orders',
        method: 'POST',
        headers: {
          'idempotency-key': idempotencyKey,
        },
        body,
      }),

      invalidatesTags: ['Cart'],
    }),
  }),
});

export const { useCreateOrderMutation } = orderApi;
