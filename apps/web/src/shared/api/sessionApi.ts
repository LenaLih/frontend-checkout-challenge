import { baseApi } from './baseApi';

type SessionResponse = {
  data: {
    id: string;
    token: string;
  };
};

export const sessionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSession: builder.mutation<SessionResponse, void>({
      query: () => ({
        url: '/api/sessions',
        method: 'POST',
        body: {},
      }),
    }),
  }),
});

export const { useCreateSessionMutation } = sessionApi;
