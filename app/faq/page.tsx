"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export default function FAQPage() {
  const faqs = [
    {
      question: "How long do the candles burn?",
      answer:
        "Our candles provide approximately 40-50 hours of burn time, depending on the size. To maximize burn time, always trim the wick to 1/4 inch before lighting and allow the wax to melt to the edge of the container on the first burn.",
    },
    {
      question: "What are the candles made from?",
      answer:
        "All our candles are hand-poured using 100% natural soy wax, premium fragrance oils, and cotton wicks. We use eco-friendly, sustainable ingredients that are vegan and cruelty-free.",
    },
    {
      question: "What paper do you use for notebooks?",
      answer:
        "Our notebooks feature high-quality, acid-free paper (120gsm) that prevents bleed-through and yellowing over time. Each notebook contains 120 pages of smooth writing paper.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Currently, we ship within the US only. We offer free shipping on orders over $50. Most orders ship within 1-2 business days and arrive within 3-5 business days.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground text-lg">
          Find answers to common questions about our products
        </p>
      </div>

      <Accordion.Root
        type="single"
        collapsible
        className="space-y-4"
      >
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
        <h2 className="text-2xl mb-3">Still have questions?</h2>
        <p className="text-muted-foreground mb-6">
          We&apos;re here to help! Feel free to reach out to us.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-primary hover:bg-accent text-primary-foreground px-8 py-3 rounded-full font-medium transition-colors shadow-sm hover:shadow-md"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
