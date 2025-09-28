import ContactModal from '@/components/molecules/contactModal/ContactModal';

export default function ContactPage() {
  return (
    <main className="min-h-screen w-full bg-black">
      <ContactModal isOpen={true} mode="page" />
    </main>
  );
}
