import "@/styles/globals.css";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const theme = createTheme();

export default function MyApp({ Component, pageProps }) {
    return (
        <ThemeProvider theme={theme}>
            <DndProvider backend={HTML5Backend}>
            <Component {...pageProps} />
            </DndProvider>
        </ThemeProvider>
    );
}
