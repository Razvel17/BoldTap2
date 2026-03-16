"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does the NFC technology work?",
    answer: "Simply tap your BoldTap card onto any NFC-enabled smartphone. The card instantly shares your contact details, social media links, and any other information you've configured in your profile.",
  },
  {
    question: "What if someone doesn't have NFC on their phone?",
    answer: "No problem! Every BoldTap card includes a QR code that can be scanned using any smartphone camera. This ensures compatibility with all devices.",
  },
  {
    question: "Can I update my information after receiving the card?",
    answer: "Yes! You can update your profile information anytime through your dashboard. Changes are instantly reflected when someone taps or scans your card.",
  },
  {
    question: "Which devices are compatible?",
    answer: "BoldTap cards work with all NFC-enabled smartphones running iOS 13+ or Android 4.4+. For devices without NFC, the QR code works on any smartphone with a camera.",
  },
  {
    question: "How do I track who has viewed my card?",
    answer: "Your dashboard includes analytics that show how many times your card has been viewed and which contacts have been captured, helping you track your networking success.",
  },
  {
    question: "Can I customize the design of my card?",
    answer: "Yes! We offer various customization options including custom branding, colors, and designs. Check out our Bold Custom product for personalized options.",
  },
];

export default function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-4">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-lg text-black pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 flex-shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-4 text-gray-600 leading-relaxed"
                >
                  {faq.answer}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
