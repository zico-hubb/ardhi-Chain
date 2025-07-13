'use client'

import React from "react";
import "./globals.css";
import "../public/bootstrap/css/bootstrap-grid.min.css"; // ✅ Import bootstrap correctly

export default function RootLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className="body">
        <div>
          {props.children}
        </div>
      </body>
    </html>
  );
}
