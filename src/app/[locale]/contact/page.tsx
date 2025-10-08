import { ContactForm } from './ContactForm';

export default function ContactPage() {
  return (
    <div className="md:p-8">
      <h2 className="text-3xl font-semibold mb-4">Contact Me</h2>
      <div className="flex justify-center items-center">
        <ContactForm />
      </div>
    </div>
  );
}
