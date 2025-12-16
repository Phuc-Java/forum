"use client";

import React from "react";
import { motion } from "framer-motion";

export default function GalleryHeader({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="text-center mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
