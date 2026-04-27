export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  color: string;
  size: string;
  tag: string;
  stars: number;
  reviews: number;
  emoji: string;
  bgColor: string;
  description: string;
  material: string;
  origin: string;
  care: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  highlights: string[];
  reviewsList: { author: string; rating: number; comment: string; avatar: string }[];
}

export const allProducts: Product[] = [
  {
    id: 1,
    name: "Petal Soft Romper",
    price: 42,
    category: "apparel",
    color: "Dusty Rose",
    size: "3-6M",
    tag: "100% Organic",
    stars: 4.8,
    reviews: 48,
    emoji: "👕",
    bgColor: "#f7f0e8",
    description:
      "Our GOTS-certified organic romper is harvested by hand to preserve the fiber's integrity. No harsh chemicals, no phthalates, no pesticides — breathably soft in a way that mimics a parent's gentle touch.",
    material: "100% Organic Cotton",
    origin: "Ethically made in Peru",
    care: "Machine wash cold",
    sizes: ["0-3M", "3-6M", "6-9M", "9-12M"],
    colors: [
      { name: "Dusty Rose", hex: "#d4a373" },
      { name: "Sage Green", hex: "#8aab97" },
      { name: "Cloud Blue", hex: "#9ac1d4" },
    ],
    highlights: ["Machine washable", "Tagless design for sensitive skin"],
    reviewsList: [
      {
        author: "Olivia M.",
        rating: 5,
        avatar: "OM",
        comment:
          "Absolute butter-soft quality. The weight of the fabric is perfect — not too thin but still very breathable for my baby's sensitive skin. The snaps are smooth and don't pull after second washing.",
      },
      {
        author: "Julia B.",
        rating: 4,
        avatar: "JB",
        comment:
          "Our pediatrician recommended switching to 100% organic fabric and this was the first one we tried. Great for eczema-prone skin. No flare ups since we started using BabyBee.",
      },
    ],
  },
  {
    id: 2,
    name: "Heritage Knit Sweater",
    price: 58,
    category: "apparel",
    color: "Sage Green",
    size: "0-3M",
    tag: "Winter Warmth",
    stars: 4.7,
    reviews: 12,
    emoji: "🧥",
    bgColor: "#e8f0e8",
    description:
      "A hand-knitted sweater inspired by traditional Andean patterns, crafted from the finest merino wool. Naturally temperature-regulating and incredibly soft against delicate newborn skin.",
    material: "100% Merino Wool",
    origin: "Handcrafted in Ecuador",
    care: "Hand wash cold, lay flat to dry",
    sizes: ["Newborn", "0-3M", "3-6M", "6-12M"],
    colors: [
      { name: "Sage Green", hex: "#8aab97" },
      { name: "Oatmeal", hex: "#e8ddd0" },
      { name: "Dusty Rose", hex: "#d4a373" },
    ],
    highlights: ["Temperature regulating", "Naturally hypoallergenic"],
    reviewsList: [
      {
        author: "Sarah K.",
        rating: 5,
        avatar: "SK",
        comment:
          "This sweater is absolutely gorgeous. The knit pattern is beautiful and it keeps my little one perfectly warm without overheating.",
      },
    ],
  },
  {
    id: 3,
    name: "Bamboo Sleepsuit",
    price: 34,
    category: "apparel",
    color: "Cloud Blue",
    size: "Newborn",
    tag: "Best Seller",
    stars: 4.9,
    reviews: 156,
    emoji: "🌙",
    bgColor: "#e8eef5",
    description:
      "Ultra-breathable bamboo viscose that stays cool in summer and warm in winter. The two-way zipper makes late-night changes a breeze, and the footless design gives tiny toes room to wiggle.",
    material: "95% Bamboo Viscose, 5% Spandex",
    origin: "GOTS Global Standard",
    care: "Machine wash cold",
    sizes: ["Newborn", "0-3M", "3-6M", "6-9M"],
    colors: [
      { name: "Cloud Blue", hex: "#9ac1d4" },
      { name: "Dusty Rose", hex: "#d4a373" },
      { name: "Oatmeal", hex: "#e8ddd0" },
    ],
    highlights: ["Two-way zipper", "Footless for growing room", "Ultra-breathable"],
    reviewsList: [
      {
        author: "Emma R.",
        rating: 5,
        avatar: "ER",
        comment:
          "We bought 5 of these! My baby sleeps so much better in bamboo. The zipper makes night feeds so easy without fully waking them.",
      },
      {
        author: "Tom H.",
        rating: 5,
        avatar: "TH",
        comment:
          "Best sleepsuit we've ever tried. Soft, durable, and still looks new after 20+ washes. Worth every penny.",
      },
    ],
  },
  {
    id: 4,
    name: "Linen Bloomers",
    price: 28,
    category: "apparel",
    color: "Oatmeal",
    size: "3-6M",
    tag: "New Arrival",
    stars: 4.6,
    reviews: 32,
    emoji: "🩲",
    bgColor: "#f5eee8",
    description:
      "Lightweight linen bloomers perfect for warm days and tummy time. The elasticated waist ensures a comfortable fit, while the natural linen fabric gets softer with every wash.",
    material: "100% European Linen",
    origin: "Made in Portugal",
    care: "Machine wash warm",
    sizes: ["0-3M", "3-6M", "6-12M", "12-24M"],
    colors: [
      { name: "Oatmeal", hex: "#e8ddd0" },
      { name: "Sand", hex: "#c9a96e" },
      { name: "Sage Green", hex: "#8aab97" },
    ],
    highlights: ["Gets softer with every wash", "Elasticated waist", "Lightweight"],
    reviewsList: [
      {
        author: "Lena M.",
        rating: 5,
        avatar: "LM",
        comment: "So adorable and comfy! My baby wore these all summer. The linen keeps her cool and they photograph beautifully.",
      },
    ],
  },
  {
    id: 5,
    name: "Essential Ribbed Tee",
    price: 18,
    category: "clothing",
    color: "Sand",
    size: "6-12M",
    tag: "Super Soft",
    stars: 4.8,
    reviews: 92,
    emoji: "👶",
    bgColor: "#eee8f5",
    description:
      "A wardrobe essential that pairs with everything. The ribbed texture adds gentle stimulation for sensory development, while the envelope neckline makes dressing fuss-free.",
    material: "100% Organic Pima Cotton",
    origin: "Made in Colombia",
    care: "Machine wash cold",
    sizes: ["0-3M", "3-6M", "6-12M", "12-18M", "18-24M"],
    colors: [
      { name: "Sand", hex: "#c9a96e" },
      { name: "Dusty Rose", hex: "#d4a373" },
      { name: "Cloud Blue", hex: "#9ac1d4" },
    ],
    highlights: ["Envelope neckline", "Sensory ribbed texture", "Mix-and-match staple"],
    reviewsList: [
      {
        author: "Priya S.",
        rating: 5,
        avatar: "PS",
        comment: "Bought 6 in different colors. The quality is exceptional for the price point. These are my go-to basics.",
      },
    ],
  },
  {
    id: 6,
    name: "Quilted Cloud Parka",
    price: 72,
    category: "apparel",
    color: "Cream",
    size: "9-12M",
    tag: "Thermal Lining",
    stars: 4.7,
    reviews: 24,
    emoji: "🧸",
    bgColor: "#e8f5f0",
    description:
      "A premium winter parka filled with recycled down alternative. The cloud-quilted design isn't just adorable — it traps warmth in each individual cell while remaining lightweight and packable.",
    material: "Recycled Polyester Shell, Thermal Fill",
    origin: "Made in Canada",
    care: "Machine wash cold, tumble dry low",
    sizes: ["6-9M", "9-12M", "12-18M", "18-24M"],
    colors: [
      { name: "Cream", hex: "#fdf6f0" },
      { name: "Dusty Rose", hex: "#d4a373" },
    ],
    highlights: ["Recycled down alternative", "Packable design", "Water-resistant shell"],
    reviewsList: [
      {
        author: "James W.",
        rating: 5,
        avatar: "JW",
        comment: "Worth every dollar. My daughter wore this for our ski trip and she stayed perfectly warm the whole time.",
      },
    ],
  },
  {
    id: 7,
    name: "Oak & Beech Rattle",
    price: 28,
    category: "toys",
    color: "Natural Wood",
    size: "All Ages",
    tag: "Handcrafted",
    stars: 4.9,
    reviews: 64,
    emoji: "🪀",
    bgColor: "#f7f0e8",
    description:
      "Sustainably sourced beechwood, hand-turned and polished with beeswax. The gentle rattle sound encourages auditory development while the smooth edges are perfectly safe for gumming.",
    material: "FSC Certified Beechwood, Beeswax Polish",
    origin: "Handmade in Vermont, USA",
    care: "Wipe clean with damp cloth",
    sizes: ["One Size"],
    colors: [{ name: "Natural Wood", hex: "#c9a96e" }],
    highlights: ["Safe for teething", "Encourages auditory development", "Zero plastic"],
    reviewsList: [
      {
        author: "Claire T.",
        rating: 5,
        avatar: "CT",
        comment: "My 4-month-old absolutely loves this. The sound is gentle and not jarring. Beautiful craftsmanship.",
      },
    ],
  },
  {
    id: 8,
    name: "Organic Swaddle Set",
    price: 48,
    category: "nursery",
    color: "Oat Milk",
    size: "Newborn",
    tag: "GOTS Certified",
    stars: 5.0,
    reviews: 201,
    emoji: "🌿",
    bgColor: "#e8f0e8",
    description:
      "A set of 3 GOTS-certified muslin swaddle blankets, each large enough to ensure a secure swaddle. The open-weave muslin breathes naturally to prevent overheating — the #1 concern for safe sleep.",
    material: "100% Organic Muslin Cotton",
    origin: "GOTS Certified facility in India",
    care: "Machine wash warm, tumble dry low",
    sizes: ["One Size — 47\" x 47\""],
    colors: [
      { name: "Oat Milk", hex: "#e8ddd0" },
      { name: "Sage Green", hex: "#8aab97" },
      { name: "Dusty Rose", hex: "#d4a373" },
    ],
    highlights: ["Set of 3 blankets", "Breathable open weave", "Gets softer with each wash"],
    reviewsList: [
      {
        author: "Nina P.",
        rating: 5,
        avatar: "NP",
        comment: "These are the BEST swaddles. Soft, large enough to actually swaddle properly, and wash incredibly well. On my 3rd set!",
      },
      {
        author: "David L.",
        rating: 5,
        avatar: "DL",
        comment: "Perfect gift. We bought these for every new parent we know. The quality is unmatched.",
      },
    ],
  },
];
