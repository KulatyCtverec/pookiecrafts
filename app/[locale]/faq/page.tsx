"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function FAQPage() {
  const t = useTranslations("faq");

  const faqs = [
    { question: t("q1"), answer: t("a1") },
    { question: t("q2"), answer: t("a2") },
    { question: t("q3"), answer: t("a3") },
    { question: t("q4"), answer: t("a4") },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl">{t("title")}</h1>
        <p className="text-muted-foreground text-lg">{t("subtitle")}</p>
      </div>

      <Accordion.Root type="single" collapsible className="space-y-4">
        {faqs.map((faq, index) => (
          <Accordion.Item
            key={index}
            value={`item-${index}`}
            className="bg-card rounded-3xl border border-border overflow-hidden"
          >
            <Accordion.Header>
              <Accordion.Trigger className="w-full flex items-center justify-between p-6 text-left hover:bg-muted transition-colors group">
                <span className="font-semibold text-lg pr-4">{faq.question}</span>
                <ChevronDown className="w-5 h-5 text-accent transition-transform duration-200 group-data-[state=open]:rotate-180 flex-shrink-0" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
              <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                {faq.answer}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>

      <div className="mt-12 text-center bg-gradient-to-br from-[#FFE6ED] to-[#FFF4E6] rounded-3xl p-8">
        <h2 className="text-2xl mb-3">{t("stillQuestions")}</h2>
        <p className="text-muted-foreground mb-6">{t("stillQuestionsText")}</p>
        <Link
          href="/contact"
          className="inline-block bg-primary hover:bg-accent text-primary-foreground px-8 py-3 rounded-full font-medium transition-colors shadow-sm hover:shadow-md"
        >
          {t("contactUs")}
        </Link>
      </div>
    </div>
  );
}
