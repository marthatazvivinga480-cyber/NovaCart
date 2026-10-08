import Icon from "./Icon.tsx";
import { useState } from "react";

export default function Contact() {
  const [preview, setPreview] = useState(false);
  return (
    <section
      className="contact-page page-width"
      id="contact"
      aria-labelledby="contact-title"
    >
      <div className="contact-intro">
        <span className="eyebrow">LET’S START A CONVERSATION</span>
        <h1 id="contact-title">Contact NovaCart</h1>
        <p>
          Questions about the collection or feedback on NovaCart? Write your message below.
        </p>
      </div>
      <div className="contact-section" aria-labelledby="contact-heading">
        <div>
          <span className="eyebrow">GET IN TOUCH</span>
          <h2 id="contact-heading">Your message</h2>
          <p>Include the product name if your question is about a particular item.</p>
        </div>
        <form
          onChange={() => setPreview(false)}
          onSubmit={(event) => {
            event.preventDefault();
            setPreview(true);
          }}
        >
          <div className="contact-fields">
            <label>
              Your name
              <input
                required
                name="name"
                autoComplete="name"
                placeholder="Your full name"
                maxLength={80}
              />
            </label>
            <label>
              Email address
              <input
                required
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>
          </div>
          <label>
            Message
            <textarea
              required
              name="message"
              placeholder="How can we help?"
              rows={5}
              maxLength={1500}
            />
          </label>
          <p className="contact-preview-note" id="contact-preview-note">Portfolio preview: your message will not be sent or saved.</p>
          <button className="primary" type="submit" aria-describedby="contact-preview-note">
            Preview message <Icon kind="mail" size={17} />
          </button>
          {preview && (
            <p role="status" className="demo-note">
              Your message is ready. Sending will be enabled when the contact
              service is connected; nothing has been sent.
            </p>
          )}
        </form>
      </div>
      <div className="contact-help">
        <h2>Before you write</h2>
        <details>
          <summary>Can I place a real order?</summary>
          <p>
            NovaCart is a portfolio demo. Checkout creates example orders; no
            payment is taken or delivery arranged.
          </p>
        </details>
        <details>
          <summary>Are these the final products and prices?</summary>
          <p>
            The collection uses illustrative photos and example prices. Product
            details will be updated as the store develops.
          </p>
        </details>
        <details>
          <summary>Will my message be sent?</summary>
          <p>
            For now, the form validates your details and displays a preview
            confirmation. It does not send or save your message.
          </p>
        </details>
      </div>
    </section>
  );
}
