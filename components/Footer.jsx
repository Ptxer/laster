"use client";

import React from 'react';
import { useSession } from "next-auth/react";

function Footer() {

  return (
    <footer className="w-full bg-gray-100 py-4">
      <div className="container mx-auto text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} UTCC Infirmary. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
