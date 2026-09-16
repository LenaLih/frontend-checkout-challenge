import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import {
  useGetCartQuery,
  useRemoveCartItemMutation,
  useSetCartItemMutation,
} from '../shared/api/cartApi';

import { formatPrice } from '../shared/lib/formatPrice';

export const CartPage = () => {
  const { data: cartData, isLoading, error } = useGetCartQuery();

  const [setCartItem, { isLoading: isUpdating }] = useSetCartItemMutation();

  const [removeCartItem, { isLoading: isRemoving }] = useRemoveCartItemMutation();

  if (isLoading) {
    return <div>Loading cart...</div>;
  }

  if (error) {
    return <div>Failed to load cart</div>;
  }

  const cart = cartData?.data;

  if (!cart || cart.items.length === 0) {
    return (
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Typography variant="h3">Корзина</Typography>

          <Typography>Корзина пуста</Typography>

          <Link to="/">
            <Button variant="outlined">Вернуться в каталог</Button>
          </Link>
        </Stack>
      </Container>
    );
  }

  const changeQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      return;
    }

    await setCartItem({
      productId,
      quantity,
    }).unwrap();
  };

  const handleRemove = async (productId: string) => {
    await removeCartItem(productId).unwrap();
  };

  return (
    <Container maxWidth="md">
      <Stack spacing={3}>
        <Typography variant="h3">Корзина</Typography>

        {cart.items.map((item) => (
          <Card key={item.productId}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">{item.title}</Typography>

                <Typography>Цена: {formatPrice(item.unitPrice, cart.currency)}</Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    disabled={isUpdating || item.quantity <= 1}
                    onClick={() => changeQuantity(item.productId, item.quantity - 1)}
                  >
                    −
                  </Button>

                  <Typography>{item.quantity}</Typography>

                  <Button
                    variant="outlined"
                    disabled={isUpdating}
                    onClick={() => changeQuantity(item.productId, item.quantity + 1)}
                  >
                    +
                  </Button>
                </Box>

                <Typography>Итого: {formatPrice(item.lineTotal, cart.currency)}</Typography>

                <Link to="/checkout">
                  <Button variant="contained">Перейти к оформлению</Button>
                </Link>

                <Button
                  color="error"
                  variant="outlined"
                  disabled={isRemoving}
                  onClick={() => handleRemove(item.productId)}
                >
                  Удалить
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}

        <Typography variant="h6">Всего товаров: {cart.quantity}</Typography>

        <Typography variant="h5">Сумма: {formatPrice(cart.subtotal, cart.currency)}</Typography>

        <Link to="/">
          <Button variant="outlined">Продолжить покупки</Button>
        </Link>
      </Stack>
    </Container>
  );
};
