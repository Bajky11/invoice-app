import { Button, Container, Typography } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
      <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '50px' }}>
        <Typography variant="h2" gutterBottom>
          Název Produktu
        </Typography>
        <Typography variant="h5" paragraph>
          Popis produktu, který zaujme uživatele.
        </Typography>
        <Link href="/auth" passHref>
          <Button variant="contained" color="primary">
            Přihlásit se / Registrovat
          </Button>
        </Link>
      </Container>
  );
}
