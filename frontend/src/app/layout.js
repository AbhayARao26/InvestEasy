import './globals.css';
import AppProviders from '@/providers/AppProviders';

export const metadata = {
  title: 'InvestEasy - AI-Powered Investment Assistant',
  description: 'Make informed investment decisions with AI-powered insights',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
