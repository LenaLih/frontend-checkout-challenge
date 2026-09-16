import { baseApi } from './baseApi';
import type { Cart, CartItem } from './cartApi';

export type PickupPoint = {
  id: string;
  title: string;
  address: string;
};

export type DeliveryMethod = {
  id: string;
  title: string;
  price: number;
  freeFrom: number | null;
  pickupPoints: PickupPoint[];
};

export type PaymentMethod = {
  id: string;
  title: string;
};

export type CheckoutOptions = {
  cart: Cart;
  deliveryMethods: DeliveryMethod[];
  paymentMethods: PaymentMethod[];
};

type CheckoutOptionsResponse = {
  data: CheckoutOptions;
};

export type CreateQuoteRequest = {
  cartVersion: number;
  delivery: QuoteDelivery;
};

export type Quote = {
  id: string;
  cartVersion: number;
  items: CartItem[];
  delivery: QuoteDelivery;
  subtotal: number;
  shipping: number;
  total: number;
  currency: 'RUB';
  expiresAt: string;
};

type QuoteResponse = {
  data: Quote;
};

export type QuoteDelivery =
  | {
      method: 'pickup';
      pickupPointId: string;
    }
  | {
      method: 'courier';
      address: {
        city: string;
        street: string;
        house: string;
        apartment?: string;
      };
    };

export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCheckoutOptions: builder.query<CheckoutOptionsResponse, void>({
      query: () => '/api/checkout/options',
      providesTags: ['Cart'],
    }),

    createQuote: builder.mutation<QuoteResponse, CreateQuoteRequest>({
      query: (body) => ({
        url: '/api/quotes',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useGetCheckoutOptionsQuery, useCreateQuoteMutation } = checkoutApi;
