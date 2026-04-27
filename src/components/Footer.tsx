import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{
        backgroundColor: "#f5e8ea",
        borderTop: "1px solid var(--color-blush-mid)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3
              className="text-xl font-bold mb-3"
              style={{ color: "var(--color-primary)" }}
            >
              BabyBee
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-mid)" }}
            >
              Crafted for calm parenting. We curate only the safest, most
              sustainable essentials for your little one&apos;s cocoon.
            </p>
            <div className="flex gap-3 mt-5">
              {/* Leaf icon */}
              <span style={{ color: "var(--color-primary)" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                >
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 6-8 6z" />
                </svg>
              </span>
              {/* Bee icon */}
              <span style={{ color: "var(--color-primary)" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                >
                  <path d="M19.5 12c0 3.59-2.91 6.5-6.5 6.5S6.5 15.59 6.5 12 9.41 5.5 13 5.5s6.5 2.91 6.5 6.5zM13 2c-1.65 0-3 1.35-3 3h6c0-1.65-1.35-3-3-3zm-7.07 3.93l-1.41 1.41C3.1 8.76 2 10.76 2 13c0 6.08 4.92 11 11 11s11-4.92 11-11c0-2.24-1.1-4.24-2.52-5.66l-1.41-1.41C18.52 4.4 16.11 3 13 3c-3.11 0-5.52 1.4-7.07 2.93z" />
                </svg>
              </span>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4
              className="font-semibold text-sm uppercase tracking-wider mb-4"
              style={{ color: "var(--color-text-dark)" }}
            >
              Collections
            </h4>
            <ul className="space-y-2">
              {[
                "Shop All",
                "Nursery",
                "Feeding",
                "Apparel",
                "Wellness",
                "Gifts",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm hover:underline transition-colors"
                    style={{ color: "var(--color-text-mid)" }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4
              className="font-semibold text-sm uppercase tracking-wider mb-4"
              style={{ color: "var(--color-text-dark)" }}
            >
              Support
            </h4>
            <ul className="space-y-2">
              {[
                "Shipping & Returns",
                "Privacy Policy",
                "Contact Us",
                "FAQ",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm hover:underline transition-colors"
                    style={{ color: "var(--color-text-mid)" }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4
              className="font-semibold text-sm uppercase tracking-wider mb-4"
              style={{ color: "var(--color-text-dark)" }}
            >
              Join the Nest
            </h4>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--color-text-mid)" }}
            >
              Receive gentle updates and exclusive collections.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 px-4 py-2.5 rounded-l-full text-sm outline-none border"
                style={{
                  borderColor: "var(--color-sand)",
                  backgroundColor: "white",
                  color: "var(--color-text-dark)",
                }}
              />
              <button
                className="px-4 py-2.5 rounded-r-full text-white font-medium text-sm"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                →
              </button>
            </div>
          </div>
        </div>

        <div
          className="mt-12 pt-6 text-center text-xs"
          style={{
            borderTop: "1px solid var(--color-blush-mid)",
            color: "var(--color-text-light)",
          }}
        >
          © 2024 BabyBee. Crafted for calm parenting.
        </div>
      </div>
    </footer>
  );
}
