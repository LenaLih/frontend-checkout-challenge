import { baseApi } from './baseApi';

export type CartItem = {
  productId: string;
  title: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Cart = {
  id: string;
  version: number;
  items: CartItem[];
  quantity: number;
  subtotal: number;
  currency: 'RUB';
};

type CartResponse = {
  data: Cart;
};

type SetCartItemResponse = {
  data: CartItem;
};

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<CartResponse, void>({
      query: () => '/api/cart',
      providesTags: ['Cart'],
    }),

    setCartItem: builder.mutation<SetCartItemResponse, { productId: string; quantity: number }>({
      query: ({ productId, quantity }) => ({
        url: `/api/cart/items/${productId}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: builder.mutation<void, string>({
      query: (productId) => ({
        url: `/api/cart/items/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const { useGetCartQuery, useSetCartItemMutation, useRemoveCartItemMutation } = cartApi;
