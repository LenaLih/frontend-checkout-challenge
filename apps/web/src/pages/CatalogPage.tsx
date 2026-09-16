import {
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import {
  useGetProductsQuery,
} from '../shared/api/productApi';

import {
  useGetCartQuery,
  useSetCartItemMutation,
} from '../shared/api/cartApi';

import { formatPrice } from '../shared/lib/formatPrice';

export const CatalogPage = () => {
  const {
    data: productsData,
    isLoading: isProductsLoading,
  } = useGetProductsQuery();

  const {
    data: cartData,
  } = useGetCartQuery();

  const [setCartItem, { isLoading: isUpdatingCart }] =
    useSetCartItemMutation();

  const handleAddToCart = async (productId: string) => {
    const currentItem = cartData?.data.items.find(
      (item) => item.productId === productId,
    );

    const currentQuantity = currentItem?.quantity ?? 0;

    await setCartItem({
      productId,
      quantity: currentQuantity + 1,
    }).unwrap();
  };

  if (isProductsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="lg">
      <Stack spacing={3}>
        <Typography variant="h3">
          Каталог
        </Typography>

        <Button
          component={RouterLink}
          to="/cart"
          variant="outlined"
        >
          Корзина ({cartData?.data.quantity ?? 0})
        </Button>

        {productsData?.data.map((product) => (
          <Card key={product.id}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">
                  {product.title}
                </Typography>

                <Typography color="text.secondary">
                  {product.description}
                </Typography>

                <Typography>
                  {formatPrice(
                    product.price,
                    product.currency,
                  )}
                </Typography>

                <Typography>
                  Остаток: {product.stock}
                </Typography>

                <Button
                  variant="contained"
                  disabled={isUpdatingCart}
                  onClick={() =>
                    handleAddToCart(product.id)
                  }
                >
                  {isUpdatingCart
                    ? 'Добавляем...'
                    : 'Добавить в корзину'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
};