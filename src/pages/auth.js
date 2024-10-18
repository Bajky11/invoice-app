import {Container, Tabs, Tab, Box, Button} from '@mui/material';
import { useState } from 'react';
import Link from 'next/link';

export default function Auth() {
    const [tabValue, setTabValue] = useState(0);

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Container maxWidth="sm" style={{ marginTop: '50px' }}>
            <Tabs value={tabValue} onChange={handleChange} centered>
                <Tab label="Přihlášení" />
                <Tab label="Registrace" />
            </Tabs>
            <Box hidden={tabValue !== 0} p={3}>
                {/* Formulář pro přihlášení */}
                <h2>Přihlášení</h2>
            </Box>
            <Box hidden={tabValue !== 1} p={3}>
                {/* Formulář pro registraci */}
                <h2>Registrace</h2>
            </Box>
            <Link href="/templates" passHref>
                <Button variant="contained" color="primary">
                    Přihlásit se / Registrovat
                </Button>
            </Link>
        </Container>
    );
}
