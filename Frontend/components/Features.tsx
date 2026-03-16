"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Smartphone, QrCode, RefreshCw, Smartphone as Phone, Users } from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "Integrated NFC",
    description: "Tap your card onto a smartphone and instantly share your contact details.",
  },
  {
    icon: QrCode,
    title: "QR Technology",
    description: "No NFC? No problem! Scan the QR code using the device camera.",
  },
  {
    icon: RefreshCw,
    title: "Convenient",
    description: "Update your profile on the fly to suit any new connection.",
  },
  {
    icon: Phone,
    title: "Cross Compatible",
    description: "Works on iOS & Android devices.",
  },
  {
    icon: Users,
    title: "Lead Generation",
    description: "Capture contact data effortlessly and grow your network.",
  },
];

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-4">
            One tap to bold your possibilities.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 rounded-xl border border-gray-200 hover:border-black transition-colors bg-white"
              >
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
