'use client'
import type { Metadata } from "next";
import React from "react";
import "./globals.css"






export default function RootLayout(props: {
  children: React.ReactNode
}) {
  return (
    <html>
      <head>
        <link rel="stylesheet" href="/bootstrap/css/bootstrap-grid.min.css" />
      </head>
      <body className="body">
        <div>
          {props.children}
        </div>
      </body>
    </html>

  )
};
