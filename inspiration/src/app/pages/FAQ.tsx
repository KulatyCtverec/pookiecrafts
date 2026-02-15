import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../components/ui/utils';

export function FAQ() {
  const faqs = [
    {
      question: 'How long do the candles burn?',
      answer: 'Our candles provide approximately 40-50 hours of burn time, depending on the size. To maximize burn time, always trim the wick to 1/4 inch before lighting and allow the wax to melt to the edge of the container on the first burn.',
    },
    {
      question: 'What are the candles made from?',
      answer: 'All our candles are hand-poured using 100% natural soy wax, premium fragrance oils, and cotton wicks. We use eco-friendly, sustainable ingredients that are vegan and cruelty-free.',
    },
    {
      question: 'What paper do you use for notebooks?',
      answer: 'Our notebooks feature high-quality, acid-free paper (120gsm) that prevents bleed-through and yellowing over time. Each notebook contains 120 pages of smooth writing paper.',
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'Currently, we ship within the US only. We offer free shipping on orders over $50. Most orders ship within 1-2 business days and arrive within 3-5 business days.',
    },
    {
      question: 'Can I return or exchange items?',
      answer: 'Yes! We accept returns and exchanges within 30 days of purchase. Items must be unused and in original condition. Candles must be unburned with the seal intact.',
    },
    {
      question: 'Do you take custom orders?',
      answer: 'We love custom orders! For bulk orders, special requests, or custom scents/designs, please contact us through our contact form. We\'ll work with you to create something special.',
    },
    {
      question: 'How should I care for my candle?',
      answer: 'Always trim the wick to 1/4 inch before lighting. Allow the wax to melt completely to the edges on first burn. Never burn for more than 4 hours at a time. Keep away from drafts and flammable objects.',
    },
    {
      question: 'Are the notebooks refillable?',
      answer: 'Our notebooks are not refillable, but they are made to last! The durable binding and quality paper ensure your notebook will hold up beautifully through everyday use.',
    },
  ];
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-lg">
          Find answers to common questions about our products
        </p>
      </div>
      
      {/* Accordion */}
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
      
      {/* Contact CTA */}
      <div className="mt-12 text-center bg-gradient-to-br from-[#FFE6ED] to-[#FFF4E6] rounded-3xl p-8">
        <h2 className="text-2xl mb-3">Still have questions?</h2>
        <p className="text-muted-foreground mb-6">
          We're here to help! Feel free to reach out to us.
        </p>
        <a 
          href="/contact"
          className="inline-block bg-primary hover:bg-accent text-primary-foreground px-8 py-3 rounded-full font-medium transition-colors shadow-sm hover:shadow-md"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
