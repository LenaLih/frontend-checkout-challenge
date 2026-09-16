import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import {
  useGetCartQuery,
  useRemoveCartItemMutation,
  useSetCartItemMutation,
} from '../shared/api/cartApi';
import { formatPrice } from '../shared/lib/formatPrice';
import { pageContainerSx } from '../shared/lib/pageContainerSx.ts';

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
      <Container maxWidth="md" sx={pageContainerSx}>
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <Typography variant="h3">Корзина</Typography>

          <Typography color="text.secondary">Корзина пуста</Typography>

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
    <Container maxWidth="lg" sx={pageContainerSx}>
      <Stack spacing={4}>
        <Typography variant="h3" sx={{ textAlign: 'center' }}>
          Корзина
        </Typography>

        <Stack spacing={3}>
          {cart.items.map((item) => (
            <Card
              key={item.productId}
              variant="outlined"
              sx={{
                borderRadius: 3,
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 2,
                    md: 3,
                  },
                  '&:last-child': {
                    pb: {
                      xs: 2,
                      md: 3,
                    },
                  },
                }}
              >
                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                      }}
                    >
                      Цена: {formatPrice(item.unitPrice, cart.currency)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={isUpdating || item.quantity <= 1}
                        onClick={() => changeQuantity(item.productId, item.quantity - 1)}
                        sx={{
                          minWidth: 40,
                        }}
                      >
                        −
                      </Button>

                      <Typography
                        sx={{
                          minWidth: 24,
                          textAlign: 'center',
                          fontWeight: 500,
                        }}
                      >
                        {item.quantity}
                      </Typography>

                      <Button
                        variant="outlined"
                        size="small"
                        disabled={isUpdating}
                        onClick={() => changeQuantity(item.productId, item.quantity + 1)}
                        sx={{
                          minWidth: 40,
                        }}
                      >
                        +
                      </Button>
                    </Box>

                    <Typography
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      Итого: {formatPrice(item.lineTotal, cart.currency)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Link to="/checkout">
                      <Button variant="contained" size="small">
                        Перейти к оформлению
                      </Button>
                    </Link>

                    <Button
                      color="error"
                      variant="text"
                      size="small"
                      disabled={isRemoving}
                      onClick={() => handleRemove(item.productId)}
                    >
                      Удалить
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Всего товаров: {cart.quantity}</Typography>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                }}
              >
                Сумма: {formatPrice(cart.subtotal, cart.currency)}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                }}
              >
                <Link to="/">
                  <Button variant="outlined">Продолжить покупки</Button>
                </Link>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};
