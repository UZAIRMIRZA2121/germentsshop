"use client";

import { useState } from "react";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { Breadcrumbs, PageHeader } from "@/components/ui/Headings";
import { useToast } from "@/context/ToastContext";
import { siteConfig } from "@/lib/config/site";
import { contactService } from "@/lib/services/demoService";
import { hasErrors, validateEmailRequired, validateFullName } from "@/lib/validation";

export default function ContactPage() {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = {
      name: validateFullName(name),
      email: validateEmailRequired(email),
      message: message.trim().length < 10 ? "Please enter a message (at least 10 characters)." : "",
    };
    setErrors(next);
    if (hasErrors(next)) return;
    await contactService.send({ name: name.trim(), email: email.trim(), message: message.trim() });
    setSent(true);
    toast.success("Message sent!", {
      message: "Your inquiry has been saved to our database.",
    });
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <PageHeader
        title="Contact Us"
        description="Questions about sizing, an existing order or returns? Reach out to our team."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} noValidate className="card space-y-4 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-ink-900">Send us a message</h2>
          {sent && (
            <Alert tone="success" title="Thanks for reaching out!">
              This is a frontend demo — no email was actually sent, but your form validation passed.
            </Alert>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />
            <Input
              label="Email Address"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
          </div>
          <Textarea
            label="Message"
            required
            placeholder="Tell us how we can help…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            error={errors.message}
          />
          <Button type="submit" size="lg" leftIcon={<Send className="h-4 w-4" />}>
            Send Message
          </Button>
        </form>

        <aside className="card space-y-5 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-ink-900">Store Information</h2>
          <ul className="space-y-4 text-sm text-ink-600">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <span>{siteConfig.contact.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="h-5 w-5 shrink-0 text-brand-600" />
              <span>{siteConfig.contact.phone}</span>
            </li>
            <li className="flex gap-3">
              <Mail className="h-5 w-5 shrink-0 text-brand-600" />
              <span>{siteConfig.contact.email}</span>
            </li>
            <li className="flex gap-3">
              <Clock className="h-5 w-5 shrink-0 text-brand-600" />
              <span>{siteConfig.contact.hours}</span>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

