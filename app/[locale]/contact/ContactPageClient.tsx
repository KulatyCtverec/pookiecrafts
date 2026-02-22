"use client";

import { useState } from "react";
import { Button } from "@/components/design-system/Button";
import { Input, Textarea } from "@/components/design-system/Input";
import { Mail, MapPin, Instagram } from "lucide-react";
import { useTranslations } from "next-intl";

export function ContactPageClient() {
  const t = useTranslations("contact");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl">{t("title")}</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-card rounded-3xl p-8 border border-border space-y-6">
            <h2 className="text-2xl">{t("contactInfo")}</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t("email")}</h3>
                  <a
                    href="mailto:pookie.crafts909@gmail.com"
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    pookie.crafts909@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t("location")}</h3>
                  <p className="text-muted-foreground">{t("prague")}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center shrink-0">
                  <Instagram className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t("social")}</h3>
                  <a
                    href="https://instagram.com/pookie.crafts.store"
                    className="text-muted-foreground hover:text-accent transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    pookie.crafts.store
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-linear-to-br from-[#FFE6ED] to-[#FFF4E6] rounded-3xl p-8">
            <h3 className="text-xl font-semibold mb-3">{t("responseTime")}</h3>
            <p className="text-muted-foreground">{t("responseTimeText")}</p>
          </div>
        </div>

        <div className="bg-card rounded-3xl p-8 border border-border">
          <h2 className="text-2xl mb-6">{t("sendMessage")}</h2>
          {submitted ? (
            <div className="bg-secondary rounded-2xl p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">{t("messageSent")}</h3>
              <p className="text-muted-foreground">{t("messageSentText")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block mb-2">
                  {t("name")}
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t("namePlaceholder")}
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-2">
                  {t("email")}
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("emailPlaceholder")}
                />
              </div>
              <div>
                <label htmlFor="subject" className="block mb-2">
                  {t("subject")}
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={t("subjectPlaceholder")}
                />
              </div>
              <div>
                <label htmlFor="message" className="block mb-2">
                  {t("message")}
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t("messagePlaceholder")}
                  rows={6}
                />
              </div>
              <Button type="submit" size="lg" className="w-full">
                {t("sendButton")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

