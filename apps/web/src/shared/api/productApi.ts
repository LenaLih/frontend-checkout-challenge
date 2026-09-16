import { baseApi } from './baseApi';

export type Product = {
  id: string;
  sku: string;
  title: string;
  description: string;
  price: number;
  currency: 'RUB';
  stock: number;
};

type ProductsResponse = {
  data: Product[];
};

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, void>({
      query: () => '/api/products',
      providesTags: ['Products'],
    }),
  }),
});

export const { useGetProductsQuery } = productApi;
