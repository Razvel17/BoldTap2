"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function Impression() {
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
          className="text-center space-y-6 max-w-4xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black">
            Make a good first impression.
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600">
            Never run out of business cards ever again.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
