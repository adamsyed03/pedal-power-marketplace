import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { LanguageProvider } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <Component {...pageProps} />
      <LanguageSwitcher />
    </LanguageProvider>
  );
}

export default MyApp; 