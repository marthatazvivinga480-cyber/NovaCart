import React from "react";
import Icon from "./Icon.tsx";

import type { Panel } from "../types.ts";
export default function Footer({
  onOpen,
  isAdmin,
}: {
  onOpen: (panel: Panel) => void;
  isAdmin: boolean;
}) {
  return (
    <>
      <a className="back-to-top" href="#">
        Back to top ↑
      </a>
      <footer className="store-footer">
        <div className="footer-inner page-width">
          <div>
            <a href="#" className="logo">
              <img
                className="brand-logo"
                src="/novacart-logo.svg"
                alt="NovaCart"
              />
            </a>
            <p>Style and essentials for your everyday.</p>
          </div>
          <nav aria-label="Footer navigation">
            <a href="#collection">Products</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            {isAdmin && (
              <button onClick={() => onOpen("studio")}>Admin dashboard</button>
            )}
          </nav>
          <p className="footer-note">
            © {new Date().getFullYear()} NovaCart
            <br />
            Portfolio demo · No real payments
          </p>
        </div>
      </footer>
    </>
  );
}
