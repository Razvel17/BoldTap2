"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

const products = [
  {
    name: "Bold Standard",
    oldPrice: "85,000 TZS",
    price: "75,000 TZS",
    description:
      "Essential digital business card with NFC and QR code technology.",
    image: { src: "/images/bold-standard.png", alt: "Bold Standard" },
  },
  {
    name: "Bold Premium",
    oldPrice: "190,000 TZS",
    price: "170,000 TZS",
    description:
      "Advanced features with premium design and enhanced analytics.",
    image: { src: "/images/bold-premium.png", alt: "Bold Premium" },
  },
  {
    name: "Bold Custom",
    oldPrice: "100,000 TZS",
    price: "90,000 TZS",
    description: "Customized design to match your brand identity perfectly.",
    image: { src: "/images/bold-custom.png", alt: "Bold Custom" },
  },
  {
    name: "Bold Button",
    oldPrice: "40,000 TZS",
    price: "35,000 TZS",
    description: "Compact button-style card for easy carrying and sharing.",
    image: { src: "/images/bold-button.png", alt: "Bold Button" },
  },
  {
    name: "Bold Band",
    oldPrice: "50,000 TZS",
    price: "48,000 TZS",
    description: "Wearable band design for hands-free networking.",
    image: { src: "/images/bold-band.png", alt: "Bold Band" },
  },
  {
    name: "Bold Ring",
    oldPrice: "220,000 TZS",
    price: "200,000 TZS",
    description: "Premium ring design with elegant NFC technology integration.",
    image: { src: "/images/bold-ring.png", alt: "Bold Ring" },
  },
  {
    name: "Bold Loyalty Card",
    oldPrice: "60,000 TZS",
    price: "55,000 TZS",
    description: "Premium ring design with elegant NFC technology integration.",
    image: { src: "/images/bold-ring.png", alt: "Bold Ring" },
  },
  {
    name: "Bold E-Invitation Card",
    oldPrice: "50,000 TZS",
    price: "45,000 TZS",
    description: "Premium ring design with elegant NFC technology integration.",
    image: { src: "/images/bold-ring.png", alt: "Bold Ring" },
  },
];

export default function Products() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="products" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-4">
            Products & Pricing
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="p-8 rounded-2xl border border-gray-200 hover:border-black transition-all bg-white shadow-sm hover:shadow-2xl"
            >
              <div className="mb-6">
                <div className="relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.image.src}
                    alt={product.image.alt}
                    className="max-h-full max-w-full object-contain drop-shadow-lg"
                  />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-black mb-1">
                {product.name}
              </h3>
              <div className="text-xl font-semibold text-gray-500 mb-1">
                NFC Digital Product
              </div>
              <div className="mt-3 mb-4">
                <span className="text-xl sm:text-xl font-bold text-black">
                  {product.oldPrice && (
                    <span className="line-through text-gray-500">
                      {product.oldPrice}
                    </span>
                  )} <br />
                  <span className="text-xl sm:text-3xl font-bold text-black">
                    {product.price}
                  </span>
                </span>
              </div>
              <p className="text-gray-500 text-sm sm:text-base mb-6 leading-relaxed">
                {product.description}
              </p>
              <Link
                href="/register"
                className="block w-full bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center"
              >
                Order Now
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
