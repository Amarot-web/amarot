import { getWhatsAppNumber, whatsappLinks } from '@/lib/contact/whatsapp';
import AlquilerClient from './AlquilerClient';

export default async function AlquilerPage() {
  const wa = whatsappLinks(await getWhatsAppNumber());
  return <AlquilerClient wa={wa} />;
}
