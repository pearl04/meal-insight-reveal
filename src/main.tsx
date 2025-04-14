import posthog from 'posthog-js';

posthog.init('phc_yGZD0ySnQObcnGh8NYxZhM6PMNibIk1Xo3mKduu3bBL', {
  api_host: 'https://app.posthog.com',
  autocapture: true, // optional, for automatic pageviews
});

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
