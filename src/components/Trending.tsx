import Icon from "./Icon.tsx";
import { categoryImages } from "../data/catalogue.ts";
import type { Category, ProductCategory } from "../types.ts";

const edits: { category: ProductCategory; title: string; caption: string }[] = [
  {
    category: "Ladies’ Wear",
    title: "The weekend outfit",
    caption: "Easy pieces. A little extra personality.",
  },
  {
    category: "Kids’ Wear",
    title: "Little styles, big energy",
    caption: "Fresh finds for their everyday adventures.",
  },
  {
    category: "Denim Jeans",
    title: "Denim days",
    caption: "Your next favourite pair starts here.",
  },
  {
    category: "Sneakers",
    title: "Street-style staples",
    caption: "Finish the look from the ground up.",
  },
];

export default function Trending({
  onCategoryChange,
}: {
  onCategoryChange: (category: Category) => void;
}) {
  return (
    <section className="trending page-width" aria-labelledby="trending-heading">
      <div className="section-title">
        <div>
          <span className="eyebrow">THE NOVACART STYLE EDIT</span>
          <h2 id="trending-heading">Trending now</h2>
        </div>
        <p>A fresh mood for every wardrobe.</p>
      </div>
      <div className="trending-grid">
        {edits.map((edit) => (
          <a
            className="trend-card"
            key={edit.category}
            href="#collection"
            onClick={() => onCategoryChange(edit.category)}
          >
            <div className="trend-photo">
              <img src={categoryImages[edit.category]} alt="" loading="lazy" />
              <span>{edit.category}</span>
            </div>
            <div className="trend-copy">
              <h3>{edit.title}</h3>
              <p>{edit.caption}</p>
              <span>
                Explore the edit <Icon kind="arrow" size={17} />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
