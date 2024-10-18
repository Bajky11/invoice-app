import { useRouter } from 'next/router';
import { Container, Button } from '@mui/material';
import Link from 'next/link';

export default function FillTemplate() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <Container style={{ marginTop: '50px' }}>
            <h1>Vyplňování Šablony {id}</h1>
            {/* Formulář pro vyplnění šablony */}
            <Link href="/templates" passHref>
                <Button variant="outlined" color="primary">
                    Zpět na přehled šablon
                </Button>
            </Link>
        </Container>
    );
}
