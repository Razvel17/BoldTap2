"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function Connecting() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black">
            Connecting, Anytime, Anywhere
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the versatility of digital business cards that work seamlessly across all devices and platforms, ensuring you never miss an opportunity to connect.
          </p>
          
          {/* Product Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 flex justify-center"
          >
            <div className="w-full max-w-4xl h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl border border-gray-300 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-32 h-32 bg-black rounded-full mx-auto"></div>
                <p className="text-gray-500 text-lg">Product Image</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
