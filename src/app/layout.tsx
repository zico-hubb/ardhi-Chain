'use client'

import React from "react";
import "./globals.css";

export default function RootLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Bootstrap CDN */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-qkU18z3+H3zJ1qVU+H9ZJ+I4hvYhJmVQYLPmddz0bYtPC2SnKiVRvVZG6H0Lz8z7"
          crossOrigin="anonymous"
        />
      </head>
      <body className="body">
        {props.children}
      </body>
    </html>
  );
}
