import { z } from 'zod';

export const checkoutSchema = z
  .object({
    name: z.string().min(2, 'Введите имя'),

    email: z.string().email('Введите корректный email'),

    phone: z
      .string()
      .regex(
        /^\+[1-9]\d{9,14}$/,
        'Введите телефон в международном формате, например +996555123456',
      ),

    city: z.string().optional(),
    street: z.string().optional(),
    house: z.string().optional(),
    apartment: z.string().optional(),

    deliveryMethod: z.string().min(1, 'Выберите способ доставки'),

    pickupPointId: z.string().optional(),

    paymentMethod: z.string().min(1, 'Выберите способ оплаты'),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === 'pickup' && !data.pickupPointId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pickupPointId'],
        message: 'Выберите пункт самовывоза',
      });
    }

    if (data.deliveryMethod === 'courier') {
      if (!data.city) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['city'],
          message: 'Введите город',
        });
      }

      if (!data.street) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['street'],
          message: 'Введите улицу',
        });
      }

      if (!data.house) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['house'],
          message: 'Введите номер дома',
        });
      }
    }
  });

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const checkoutDefaultValues: CheckoutFormValues = {
  name: '',
  email: '',
  phone: '',

  city: '',
  street: '',
  house: '',
  apartment: '',

  deliveryMethod: '',
  pickupPointId: '',
  paymentMethod: '',
};
