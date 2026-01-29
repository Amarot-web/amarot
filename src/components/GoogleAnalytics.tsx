import Script from 'next/script';
import { createAdminClient } from '@/lib/supabase/server';

async function getGAMeasurementId(): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'google_analytics_id')
      .single();

    if (data?.value && typeof data.value === 'string') {
      return data.value;
    }
  } catch {
    // Si hay error, simplemente no cargamos GA
  }
  return null;
}

export default async function GoogleAnalytics() {
  const measurementId = await getGAMeasurementId();

  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
