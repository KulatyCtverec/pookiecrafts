"use client";

import { useState } from "react";
import { Button } from "@/components/design-system/Button";
import { Input, Textarea } from "@/components/design-system/Input";
import { Mail, MapPin, Instagram } from "lucide-react";

export default function ContactPage() {
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
        <h1 className="text-4xl md:text-5xl">Get in Touch</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Have a question or want to chat? We&apos;d love to hear from you!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-card rounded-3xl p-8 border border-border space-y-6">
            <h2 className="text-2xl">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <a
                    href="mailto:hello@pookiecrafts.com"
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    hello@pookiecrafts.com
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Location</h3>
                  <p className="text-muted-foreground">
                    Portland, Oregon
                    <br />
                    United States
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <Instagram className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Social</h3>
                  <a
                    href="https://instagram.com/pookiecrafts"
                    className="text-muted-foreground hover:text-accent transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @pookiecrafts
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#FFE6ED] to-[#FFF4E6] rounded-3xl p-8">
            <h3 className="text-xl font-semibold mb-3">Response Time</h3>
            <p className="text-muted-foreground">
              We typically respond to all inquiries within 24-48 hours. For
              urgent matters, please mention &quot;URGENT&quot; in your subject
              line.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-3xl p-8 border border-border">
          <h2 className="text-2xl mb-6">Send us a Message</h2>
          {submitted ? (
            <div className="bg-secondary rounded-2xl p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Message Sent!</h3>
              <p className="text-muted-foreground">
                Thank you for reaching out. We&apos;ll get back to you soon!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block mb-2">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block mb-2">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                />
              </div>
              <div>
                <label htmlFor="message" className="block mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more..."
                  rows={6}
                />
              </div>
              <Button type="submit" size="lg" className="w-full">
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
