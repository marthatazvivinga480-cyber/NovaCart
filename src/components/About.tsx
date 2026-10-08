import {
  ArrowRight,
  Compass,
  Eye,
  Gem,
  Heart,
  Layers3,
  Sparkles,
  Target,
} from "lucide-react";
import { categories, categoryImages } from "../data/catalogue.ts";
import type { Category, ProductCategory } from "../types.ts";

const values = [
  {
    icon: Eye,
    title: "Clarity comes first",
    text: "Our aim is to make product information easy to understand, so browsing feels straightforward and decisions feel informed.",
  },
  {
    icon: Heart,
    title: "Room for your own style",
    text: "Everyday looks are personal. We bring different categories together to leave room for your taste, your family and your routine.",
  },
  {
    icon: Layers3,
    title: "Thoughtful selection",
    text: "We want a collection that feels connected: clothing, accessories and technology with a place in everyday life.",
  },
];

export default function About({
  onCategoryChange,
}: {
  onCategoryChange: (category: Category) => void;
}) {
  return (
    <section className="about-page page-width" aria-labelledby="about-title">
      <div className="about-opening">
        <div className="about-intro">
          <span className="eyebrow">THE STORY BEHIND NOVACART</span>
          <h1 id="about-title">
            Good finds.
            <br />
            Your kind of everyday.
          </h1>
          <p>
            A favourite outfit. A little detail that completes it. Something
            useful for the day ahead. NovaCart brings these discoveries
            together, in a place made for exploring.
          </p>
          <a
            className="primary"
            href="#collection"
            onClick={() => onCategoryChange("All")}
          >
            Explore NovaCart <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
        <div className="about-photo-collage">
          <img
            className="about-main-photo"
            src="/images/products/ladies-striped-blouse.jpg"
            alt="Striped blouse from the NovaCart fashion edit"
          />
          <img
            className="about-detail-photo"
            src="/images/products/silver-necklace.jpg"
            alt="Silver-tone necklace from the jewellery edit"
          />
          <span className="about-photo-caption">
            <Sparkles size={16} aria-hidden="true" /> Style in the details.
          </span>
        </div>
      </div>

      <section className="about-story" aria-labelledby="story-title">
        <div>
          <span className="eyebrow">OUR STARTING POINT</span>
          <h2 id="story-title">
            One idea.
            <br />
            Many ways to make it yours.
          </h2>
        </div>
        <div>
          <p>
            NovaCart started with the idea of creating an independent shopping
            experience that brings different parts of everyday life together.
            Fashion is at its heart, with jewellery, ladies’ wear, kids’ wear,
            sneakers and denim alongside phones.
          </p>
          <p>
            We are building a store that feels welcoming and easy to explore.
            Rather than rushing from one category to another, you can browse the
            collection, save the pieces you love and put together your own
            selection.
          </p>
          <p>
            This portfolio edition is the first step: a working demonstration of
            the experience we want to create, with room to grow into a real
            collection.
          </p>
        </div>
      </section>

      <div className="about-purpose">
        <section className="about-mission" aria-labelledby="mission-title">
          <Target size={27} aria-hidden="true" />
          <span className="eyebrow">WHAT GUIDES US</span>
          <h2 id="mission-title">Our mission</h2>
          <p>
            To bring fashion, family essentials and everyday technology together
            through a clear, enjoyable shopping experience that makes discovery
            simple.
          </p>
        </section>
        <section className="about-vision" aria-labelledby="vision-title">
          <Compass size={27} aria-hidden="true" />
          <span className="eyebrow">WHERE WE WANT TO GO</span>
          <h2 id="vision-title">Our vision</h2>
          <p>
            To grow into a welcoming destination where people can discover their
            personal style and useful everyday finds, with confidence in what
            they are choosing.
          </p>
        </section>
      </div>

      <section className="about-principles" aria-labelledby="values-title">
        <span className="eyebrow">THE WAY WE WANT TO WORK</span>
        <h2 id="values-title">Small details. Clear values.</h2>
        <div className="about-values">
          {values.map(({ icon: ValueIcon, title, text }) => (
            <article key={title}>
              <ValueIcon size={25} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="about-collection"
        aria-labelledby="about-collection-title"
      >
        <div className="section-title">
          <div>
            <span className="eyebrow">SIX CATEGORIES. ONE NOVACART.</span>
            <h2 id="about-collection-title">Meet the collection.</h2>
          </div>
          <Gem size={25} aria-hidden="true" />
        </div>
        <div className="about-category-grid">
          {categories
            .filter(
              (category): category is ProductCategory => category !== "All",
            )
            .map((category) => (
              <a
                href="#collection"
                key={category}
                onClick={() => onCategoryChange(category)}
              >
                <img src={categoryImages[category]} alt="" loading="lazy" />
                <span>
                  {category}
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </a>
            ))}
        </div>
      </section>

      <section className="about-demo" aria-labelledby="about-demo-title">
        <span className="eyebrow">A STORE TAKING SHAPE</span>
        <h2 id="about-demo-title">Explore the idea. See the experience.</h2>
        <p>
          NovaCart is currently a portfolio demo. The product photos are
          illustrative, prices and ratings are examples, and checkout creates
          demo orders without taking payment.
        </p>
        <div className="about-final-actions">
          <a
            className="primary"
            href="#collection"
            onClick={() => onCategoryChange("All")}
          >
            Find your next favourite <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a href="#contact">
            Get in touch <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>
    </section>
  );
}
