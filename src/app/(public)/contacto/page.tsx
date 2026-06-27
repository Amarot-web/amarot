import { getWhatsAppNumber, whatsappLinks } from '@/lib/contact/whatsapp';
import ContactoClient from './ContactoClient';

export default async function ContactoPage() {
  const wa = whatsappLinks(await getWhatsAppNumber());
  return <ContactoClient wa={wa} />;
}
