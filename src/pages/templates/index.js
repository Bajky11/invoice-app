import { Container, Grid, Button } from '@mui/material';
import Link from 'next/link';

const sampleTemplates = [1, 2, 3, 4, 5, 6]; // Vzorová data

export default function Templates() {
    return (
        <Container style={{ marginTop: '50px' }}>
            <Link href="/templates/editor" passHref>
                <Button variant="contained" color="primary" style={{ marginBottom: '20px' }}>
                    Vytvořit novou šablonu
                </Button>
            </Link>
            <Grid container spacing={3}>
                {sampleTemplates.map((template) => (
                    <Grid item xs={12} sm={6} md={4} key={template}>
                        <Link href={`/templates/${template}`} passHref>
                            <div
                                style={{
                                    border: '1px solid #ccc',
                                    height: '250px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                {/* Náhled šablony */}
                                <span>Šablona {template}</span>
                            </div>
                        </Link>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}
