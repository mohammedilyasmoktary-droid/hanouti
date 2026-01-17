import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

const categoriesData = [
  {
    nameFr: "Produits Laitiers & Œufs",
    nameAr: "منتجات الألبان والبيض",
    slug: "produits-laitiers-oeufs",
    imageUrl: "https://images.unsplash.com/photo-1628088999033-021725122319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzQ5NDJ8MHwxfHNlYXJjaHwxfHxkYWlyeSUyMGFuZCUyMGVnZ3N8ZW5wwfHx8fDE3MDQ3NDY2Njd8MA&ixlib=rb-4.0.3&q=80&w=1080",
    sortOrder: 1,
    children: [
      { nameFr: "Lait", nameAr: "حليب", slug: "lait", sortOrder: 1 },
      { nameFr: "Lben & Raib", nameAr: "لبن وريب", slug: "lben-raib", sortOrder: 2 },
      { nameFr: "Yaourts", nameAr: "زبادي", slug: "yaourts", sortOrder: 3 },
      { nameFr: "Fromages", nameAr: "جبن", slug: "fromages", sortOrder: 4 },
      { nameFr: "Beurre & Crème", nameAr: "زبدة وقشدة", slug: "beurre-creme", sortOrder: 5 },
      { nameFr: "Œufs", nameAr: "بيض", slug: "oeufs", sortOrder: 6 },
    ],
  },
  {
    nameFr: "Boulangerie & Pain",
    nameAr: "مخبوزات وخبز",
    slug: "boulangerie-pain",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzQ5NDJ8MHwxfHNlYXJjaHwxfHxiYWtlcnl8ZW5wwfHx8fDE3MDQ3NDY2Njd8MA&ixlib=rb-4.0.3&q=80&w=1080",
    sortOrder: 2,
    children: [
      { nameFr: "Pain rond (khobz)", nameAr: "خبز مستدير (خبز)", slug: "pain-rond-khobz", sortOrder: 1 },
      { nameFr: "Pain long", nameAr: "خبز طويل", slug: "pain-long", sortOrder: 2 },
      { nameFr: "Pain de mie", nameAr: "خبز التوست", slug: "pain-de-mie", sortOrder: 3 },
      { nameFr: "Tortillas & wraps", nameAr: "تورتياس ولفائف", slug: "tortillas-wraps", sortOrder: 4 },
      { nameFr: "Gâteaux simples", nameAr: "كعك بسيط", slug: "gateaux-simples", sortOrder: 5 },
    ],
  },
  {
    nameFr: "Épicerie Sèche",
    nameAr: "مواد غذائية جافة",
    slug: "epicerie-seche",
    imageUrl: "https://images.unsplash.com/photo-1543083477-4f785ae676f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzQ5NDJ8MHwxfHNlYXJjaHwxfHxzYWx0eSUyMGdyb2Nlcnl8ZW5wwfHx8fDE3MDQ3NDY2Njd8MA&ixlib=rb-4.0.3&q=80&w=1080",
    sortOrder: 3,
    children: [
      { nameFr: "Riz", nameAr: "أرز", slug: "riz", sortOrder: 1 },
      { nameFr: "Pâtes", nameAr: "معكرونة", slug: "pates", sortOrder: 2 },
      { nameFr: "Semoule", nameAr: "سميد", slug: "semoule", sortOrder: 3 },
      { nameFr: "Farine", nameAr: "دقيق", slug: "farine", sortOrder: 4 },
      { nameFr: "Légumineuses", nameAr: "بقوليات", slug: "legumineuses", sortOrder: 5 },
      { nameFr: "Conserves", nameAr: "معلبات", slug: "conserver", sortOrder: 6 },
    ],
  },
  {
    nameFr: "Huiles, Épices & Condiments",
    nameAr: "زيوت، بهارات وتوابل",
    slug: "huiles-epices-condiments",
    imageUrl: "https://images.unsplash.com/photo-1627483262604-ad386f01949e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzQ5NDJ8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMG9pbHxlbnwwfHx8fDE3MDQ3NDY2Njd8MA&ixlib=rb-4.0.3&q=80&w=1080",
    sortOrder: 4,
    children: [
      { nameFr: "Huile de table", nameAr: "زيت المائدة", slug: "huile-de-table", sortOrder: 1 },
      { nameFr: "Huile d'olive", nameAr: "زيت الزيتون", slug: "huile-dolive", sortOrder: 2 },
      { nameFr: "Épices", nameAr: "بهارات", slug: "epices", sortOrder: 3 },
      { nameFr: "Sel & sucre", nameAr: "ملح وسكر", slug: "sel-sucre", sortOrder: 4 },
      { nameFr: "Sauces & harissa", nameAr: "صلصات وهريسة", slug: "sauces-harissa", sortOrder: 5 },
      { nameFr: "Vinaigre", nameAr: "خل", slug: "vinaigre", sortOrder: 6 },
    ],
  },
  {
    nameFr: "Thé, Café & Petit-Déjeuner",
    nameAr: "شاي، قهوة وفطور",
    slug: "the-cafe-petit-dejeuner",
    imageUrl: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzQ5NDJ8MHwxfHNlYXJjaHwxfHxjb2ZmZWV8ZW5wwfHx8fDE3MDQ3NDY2Njd8MA&ixlib=rb-4.0.3&q=80&w=1080",
    sortOrder: 5,
    children: [
      { nameFr: "Thé", nameAr: "شاي", slug: "the", sortOrder: 1 },
      { nameFr: "Café", nameAr: "قهوة", slug: "cafe", sortOrder: 2 },
      { nameFr: "Sucre", nameAr: "سكر", slug: "sucre", sortOrder: 3 },
      { nameFr: "Confitures", nameAr: "مربى", slug: "confitures", sortOrder: 4 },
      { nameFr: "Miel", nameAr: "عسل", slug: "miel", sortOrder: 5 },
      { nameFr: "Céréales", nameAr: "حبوب", slug: "cereales", sortOrder: 6 },
    ],
  },
  {
    nameFr: "Biscuits, Snacks & Confiserie",
    nameAr: "بسكويت، وجبات خفيفة وحلويات",
    slug: "biscuits-snacks-confiserie",
    imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzQ5NDJ8MHwxfHNlYXJjaHwxfHxzbmFja3N8ZW5wwfHx8fDE3MDQ3NDY2Njd8MA&ixlib=rb-4.0.3&q=80&w=1080",
    sortOrder: 6,
    children: [
      { nameFr: "Biscuits", nameAr: "بسكويت", slug: "biscuits", sortOrder: 1 },
      { nameFr: "Gâteaux", nameAr: "كعك", slug: "gateaux", sortOrder: 2 },
      { nameFr: "Chocolats", nameAr: "شوكولاتة", slug: "chocolats", sortOrder: 3 },
      { nameFr: "Bonbons", nameAr: "حلويات", slug: "bonbons", sortOrder: 4 },
      { nameFr: "Chips", nameAr: "رقائق", slug: "chips", sortOrder: 5 },
      { nameFr: "Fruits secs emballés", nameAr: "فواكه مجففة معبأة", slug: "fruits-secs-emballes", sortOrder: 6 },
    ],
  },
  {
    nameFr: "Produits Surgelés",
    nameAr: "منتجات مجمدة",
    slug: "produits-surgees",
    imageUrl: "https://images.unsplash.com/photo-1606902965551-dce093cda6e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzQ5NDJ8MHwxfHNlYXJjaHwxfHxmcm96ZW58ZW5wwfHx8fDE3MDQ3NDY2Njd8MA&ixlib=rb-4.0.3&q=80&w=1080",
    sortOrder: 7,
    children: [
      { nameFr: "Légumes surgelés", nameAr: "خضروات مجمدة", slug: "legumes-surgees", sortOrder: 1 },
      { nameFr: "Plats surgelés", nameAr: "أطباق مجمدة", slug: "plats-surgees", sortOrder: 2 },
      { nameFr: "Frites", nameAr: "بطاطس مقلية", slug: "frites", sortOrder: 3 },
      { nameFr: "Glaces", nameAr: "آيس كريم", slug: "glaces", sortOrder: 4 },
    ],
  },
  {
    nameFr: "Boissons",
    nameAr: "مشروبات",
    slug: "boissons",
    imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzQ5NDJ8MHwxfHNlYXJjaHwxfHxkcmlua3N8ZW5wwfHx8fDE3MDQ3NDY2Njd8MA&ixlib=rb-4.0.3&q=80&w=1080",
    sortOrder: 8,
    children: [
      { nameFr: "Eau minérale", nameAr: "مياه معدنية", slug: "eau-minerale", sortOrder: 1 },
      { nameFr: "Jus", nameAr: "عصير", slug: "jus", sortOrder: 2 },
      { nameFr: "Sodas", nameAr: "مشروبات غازية", slug: "sodas", sortOrder: 3 },
      { nameFr: "Boissons énergétiques", nameAr: "مشروبات طاقة", slug: "boissons-energetiques", sortOrder: 4 },
      { nameFr: "Boissons lactées", nameAr: "مشروبات ألبان", slug: "boissons-lactees", sortOrder: 5 },
    ],
  },
  {
    nameFr: "Produits d'Entretien",
    nameAr: "منتجات التنظيف",
    slug: "produits-dentretien",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-adab4f76667b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzQ5NDJ8MHwxfHNlYXJjaHwxfHxjbGVhbmluZ3xlbnwwfHx8fDE3MDQ3NDY2Njd8MA&ixlib=rb-4.0.3&q=80&w=1080",
    sortOrder: 9,
    children: [
      { nameFr: "Lessive", nameAr: "منظف", slug: "lessive", sortOrder: 1 },
      { nameFr: "Liquide vaisselle", nameAr: "سائل غسيل الأطباق", slug: "liquide-vaisselle", sortOrder: 2 },
      { nameFr: "Nettoyant sol", nameAr: "منظف الأرضيات", slug: "nettoyant-sol", sortOrder: 3 },
      { nameFr: "Eau de javel", nameAr: "مبيض", slug: "eau-de-javel", sortOrder: 4 },
      { nameFr: "Papier toilette", nameAr: "ورق التواليت", slug: "papier-toilette", sortOrder: 5 },
      { nameFr: "Essuie-tout", nameAr: "مناديل ورقية", slug: "essuie-tout", sortOrder: 6 },
    ],
  },
  {
    nameFr: "Hygiène & Soins",
    nameAr: "نظافة ورعاية",
    slug: "hygiene-soins",
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzQ5NDJ8MHwxfHNlYXJjaHwxfHxoZWFsdGh8ZW5wwfHx8fDE3MDQ3NDY2Njd8MA&ixlib=rb-4.0.3&q=80&w=1080",
    sortOrder: 10,
    children: [
      { nameFr: "Savons", nameAr: "صابون", slug: "savons", sortOrder: 1 },
      { nameFr: "Shampoings", nameAr: "شامبو", slug: "shampoings", sortOrder: 2 },
      { nameFr: "Dentifrice", nameAr: "معجون أسنان", slug: "dentifrice", sortOrder: 3 },
      { nameFr: "Déodorants", nameAr: "مزيل عرق", slug: "deodorants", sortOrder: 4 },
      { nameFr: "Rasage", nameAr: "حلاقة", slug: "rasage", sortOrder: 5 },
      { nameFr: "Protection féminine", nameAr: "منتجات نسائية", slug: "protection-feminine", sortOrder: 6 },
    ],
  },
  {
    nameFr: "Bébé",
    nameAr: "رضيع",
    slug: "bebe",
    imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0eac78b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzQ5NDJ8MHwxfHNlYXJjaHwxfHxiYWJ5fGVufDB8fHx8fDE3MDQ3NDY2Njd8MA&ixlib=rb-4.0.3&q=80&w=1080",
    sortOrder: 11,
    children: [
      { nameFr: "Lait bébé", nameAr: "حليب الأطفال", slug: "lait-bebe", sortOrder: 1 },
      { nameFr: "Petits pots", nameAr: "أوعية صغيرة", slug: "petits-pots", sortOrder: 2 },
      { nameFr: "Couches", nameAr: "حفاضات", slug: "couches", sortOrder: 3 },
      { nameFr: "Lingettes", nameAr: "مناديل مبللة", slug: "lingettes", sortOrder: 4 },
    ],
  },
  {
    nameFr: "Animaux",
    nameAr: "حيوانات",
    slug: "animaux",
    imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzQ5NDJ8MHwxfHNlYXJjaHwxfHxwZXR8ZW5wwfHx8fDE3MDQ3NDY2Njd8MA&ixlib=rb-4.0.3&q=80&w=1080",
    sortOrder: 12,
    children: [
      { nameFr: "Nourriture chiens", nameAr: "طعام الكلاب", slug: "nourriture-chiens", sortOrder: 1 },
      { nameFr: "Nourriture chats", nameAr: "طعام القطط", slug: "nourriture-chats", sortOrder: 2 },
      { nameFr: "Litière", nameAr: "فضلات القطط", slug: "litiere", sortOrder: 3 },
    ],
  },
  {
    nameFr: "Produits du Quartier",
    nameAr: "منتجات الحي",
    slug: "produits-du-quartier",
    imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzQ5NDJ8MHwxfHNlYXJjaHwxfHxsb2NhbCUyMGZvb2R8ZW5wwfHx8fDE3MDQ3NDY2Njd8MA&ixlib=rb-4.0.3&q=80&w=1080",
    sortOrder: 13,
    children: [
      { nameFr: "Pain du jour", nameAr: "خبز اليوم", slug: "pain-du-jour", sortOrder: 1 },
      { nameFr: "Lben frais", nameAr: "لبن طازج", slug: "lben-frais", sortOrder: 2 },
      { nameFr: "Produits faits maison", nameAr: "منتجات منزلية", slug: "produits-faits-maison", sortOrder: 3 },
      { nameFr: "Articles à la pièce", nameAr: "مقالات بالقطعة", slug: "articles-a-la-piece", sortOrder: 4 },
    ],
  },
]

// Product templates by category slug
const PRODUCT_TEMPLATES: Record<string, Array<{
  nameFr: string
  brand: string
  size: string
  price: number
  description: string
}>> = {
  // Épicerie Sèche
  "riz": [
    { nameFr: "Riz long grain", brand: "Taous", size: "1 kg", price: 22.90, description: "Riz long grain — Taous — 1 kg" },
    { nameFr: "Riz basmati", brand: "Tilda", size: "1 kg", price: 49.90, description: "Riz basmati — Tilda — 1 kg" },
    { nameFr: "Riz rond", brand: "Local", size: "1 kg", price: 24.90, description: "Riz rond — Local — 1 kg" },
    { nameFr: "Riz complet", brand: "Uncle Ben's", size: "1 kg", price: 39.90, description: "Riz complet — Uncle Ben's — 1 kg" },
  ],
  "pates": [
    { nameFr: "Spaghetti", brand: "Panzani", size: "500 g", price: 14.90, description: "Spaghetti — Panzani — 500 g" },
    { nameFr: "Macaroni", brand: "Dari", size: "500 g", price: 12.90, description: "Macaroni — Dari — 500 g" },
    { nameFr: "Penne", brand: "Barilla", size: "500 g", price: 18.90, description: "Penne — Barilla — 500 g" },
    { nameFr: "Vermicelles", brand: "Local", size: "500 g", price: 9.90, description: "Vermicelles — Local — 500 g" },
  ],
  "semoule": [
    { nameFr: "Semoule fine", brand: "Dari Couspate", size: "1 kg", price: 16.90, description: "Semoule fine — Dari Couspate — 1 kg" },
    { nameFr: "Semoule moyenne", brand: "Dari Couspate", size: "1 kg", price: 16.90, description: "Semoule moyenne — Dari Couspate — 1 kg" },
    { nameFr: "Semoule complète", brand: "Dari", size: "1 kg", price: 18.90, description: "Semoule complète — Dari — 1 kg" },
    { nameFr: "Farine de maïs (polenta)", brand: "Marca", size: "500 g", price: 19.90, description: "Farine de maïs (polenta) — Marca — 500 g" },
  ],
  "farine": [
    { nameFr: "Farine blanche", brand: "Forafric", size: "1 kg", price: 11.90, description: "Farine blanche — Forafric — 1 kg" },
    { nameFr: "Farine complète", brand: "Forafric", size: "1 kg", price: 14.90, description: "Farine complète — Forafric — 1 kg" },
    { nameFr: "Farine pâtissière", brand: "Francine", size: "1 kg", price: 19.90, description: "Farine pâtissière — Francine — 1 kg" },
    { nameFr: "Levure chimique", brand: "Alsa", size: "5 sachets", price: 12.90, description: "Levure chimique — Alsa — 5 sachets" },
  ],
  "legumineuses": [
    { nameFr: "Lentilles", brand: "Local", size: "1 kg", price: 22.90, description: "Lentilles — Local — 1 kg" },
    { nameFr: "Pois chiches", brand: "Local", size: "1 kg", price: 24.90, description: "Pois chiches — Local — 1 kg" },
    { nameFr: "Haricots blancs", brand: "Local", size: "1 kg", price: 26.90, description: "Haricots blancs — Local — 1 kg" },
    { nameFr: "Fèves sèches", brand: "Local", size: "1 kg", price: 19.90, description: "Fèves sèches — Local — 1 kg" },
  ],
  "conserver": [ // Note: slug is "conserver" in seed data (typo, but keeping for compatibility)
    { nameFr: "Thon à l'huile", brand: "John West", size: "160 g", price: 19.90, description: "Thon à l'huile — John West — 160 g" },
    { nameFr: "Sardines", brand: "Connétable", size: "125 g", price: 14.90, description: "Sardines — Connétable — 125 g" },
    { nameFr: "Tomates pelées", brand: "Aïcha", size: "400 g", price: 9.90, description: "Tomates pelées — Aïcha — 400 g" },
    { nameFr: "Maïs", brand: "Bonduelle", size: "300 g", price: 16.90, description: "Maïs — Bonduelle — 300 g" },
  ],
  "conserves": [ // Also support "conserves" slug if it exists
    { nameFr: "Thon à l'huile", brand: "John West", size: "160 g", price: 19.90, description: "Thon à l'huile — John West — 160 g" },
    { nameFr: "Sardines", brand: "Connétable", size: "125 g", price: 14.90, description: "Sardines — Connétable — 125 g" },
    { nameFr: "Tomates pelées", brand: "Aïcha", size: "400 g", price: 9.90, description: "Tomates pelées — Aïcha — 400 g" },
    { nameFr: "Maïs", brand: "Bonduelle", size: "300 g", price: 16.90, description: "Maïs — Bonduelle — 300 g" },
  ],
  // Huiles, Épices & Condiments
  "huile-de-table": [
    { nameFr: "Huile de tournesol", brand: "Lesieur Cristal", size: "1 L", price: 24.90, description: "Huile de tournesol — Lesieur Cristal — 1 L" },
    { nameFr: "Huile de maïs", brand: "Mazola", size: "1 L", price: 34.90, description: "Huile de maïs — Mazola — 1 L" },
    { nameFr: "Huile végétale", brand: "Local", size: "1 L", price: 19.90, description: "Huile végétale — Local — 1 L" },
    { nameFr: "Spray huile cuisson", brand: "Brandless", size: "200 ml", price: 29.90, description: "Spray huile cuisson — Brandless — 200 ml" },
  ],
  "huile-dolive": [
    { nameFr: "Huile d'olive extra vierge", brand: "Lesieur Cristal", size: "1 L", price: 79.90, description: "Huile d'olive extra vierge — Lesieur Cristal — 1 L" },
    { nameFr: "Huile d'olive", brand: "Local", size: "1 L", price: 69.90, description: "Huile d'olive — Local — 1 L" },
    { nameFr: "Huile d'olive", brand: "Borges", size: "500 ml", price: 59.90, description: "Huile d'olive — Borges — 500 ml" },
    { nameFr: "Huile d'olive vierge", brand: "Terra Delyssa", size: "500 ml", price: 64.90, description: "Huile d'olive vierge — Terra Delyssa — 500 ml" },
  ],
  "epices": [
    { nameFr: "Ras el hanout", brand: "Local", size: "50 g", price: 14.90, description: "Ras el hanout — Local — 50 g" },
    { nameFr: "Cumin moulu", brand: "Ducros", size: "40 g", price: 19.90, description: "Cumin moulu — Ducros — 40 g" },
    { nameFr: "Paprika", brand: "Ducros", size: "40 g", price: 19.90, description: "Paprika — Ducros — 40 g" },
    { nameFr: "Gingembre moulu", brand: "Local", size: "50 g", price: 12.90, description: "Gingembre moulu — Local — 50 g" },
  ],
  "sel-sucre": [
    { nameFr: "Sel fin", brand: "Local", size: "1 kg", price: 6.90, description: "Sel fin — Local — 1 kg" },
    { nameFr: "Sucre en morceaux", brand: "Cosumar", size: "1 kg", price: 12.90, description: "Sucre en morceaux — Cosumar — 1 kg" },
    { nameFr: "Sucre semoule", brand: "Cosumar", size: "1 kg", price: 11.90, description: "Sucre semoule — Cosumar — 1 kg" },
    { nameFr: "Sel de mer", brand: "Local", size: "500 g", price: 9.90, description: "Sel de mer — Local — 500 g" },
  ],
  "sauces-harissa": [
    { nameFr: "Harissa", brand: "Le Phare du Cap Bon", size: "200 g", price: 19.90, description: "Harissa — Le Phare du Cap Bon — 200 g" },
    { nameFr: "Ketchup", brand: "Heinz", size: "400 g", price: 24.90, description: "Ketchup — Heinz — 400 g" },
    { nameFr: "Mayonnaise", brand: "Lesieur", size: "235 g", price: 18.90, description: "Mayonnaise — Lesieur — 235 g" },
    { nameFr: "Sauce soja", brand: "Kikkoman", size: "150 ml", price: 29.90, description: "Sauce soja — Kikkoman — 150 ml" },
  ],
  "vinaigre": [
    { nameFr: "Vinaigre blanc", brand: "Local", size: "1 L", price: 9.90, description: "Vinaigre blanc — Local — 1 L" },
    { nameFr: "Vinaigre de cidre", brand: "Bragg", size: "473 ml", price: 49.90, description: "Vinaigre de cidre — Bragg — 473 ml" },
    { nameFr: "Vinaigre balsamique", brand: "Ponti", size: "500 ml", price: 34.90, description: "Vinaigre balsamique — Ponti — 500 ml" },
    { nameFr: "Vinaigre de vin", brand: "Local", size: "500 ml", price: 12.90, description: "Vinaigre de vin — Local — 500 ml" },
  ],
}

// Generate slug from product name, brand, and size
function generateSlug(nameFr: string, brand: string, size: string, categorySlug: string, index: number): string {
  const base = `${categorySlug}-${index}-${nameFr} ${brand} ${size}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  return base
}

// Generate fallback products for categories without templates
function generateFallbackProducts(categoryName: string, categorySlug: string): Array<{
  nameFr: string
  brand: string
  size: string
  price: number
  description: string
}> {
  const brands = ["Local", "Marque Premium", "Marque Standard", "Marque Économique"]
  const sizes = ["1 unité", "500 g", "1 L", "1 kg"]
  const basePrices = [15.90, 24.90, 19.90, 29.90]
  
  return Array.from({ length: 4 }, (_, i) => ({
    nameFr: `${categoryName} ${i + 1}`,
    brand: brands[i],
    size: sizes[i],
    price: basePrices[i],
    description: `${categoryName} ${i + 1} — ${brands[i]} — ${sizes[i]}`,
  }))
}

async function main() {
  console.log("🌱 Seeding database...")

  const adminEmail = "admin@hanouti.ma"
  const adminPassword = await hash("admin123", 12)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPassword,
      role: "ADMIN",
    },
    create: {
      email: adminEmail,
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  })
  console.log("✅ Admin user created:", adminEmail)

  // Don't delete products - use upsert for idempotency
  console.log("📦 Seeding products (idempotent - will upsert by slug)")

  const categoryMap = new Map<string, string>()

  for (const categoryData of categoriesData) {
    const { children, ...parentData } = categoryData

    const parent = await prisma.category.upsert({
      where: { slug: parentData.slug },
      update: {
        nameFr: parentData.nameFr,
        nameAr: parentData.nameAr,
        imageUrl: parentData.imageUrl,
        sortOrder: parentData.sortOrder,
        isActive: true,
      },
      create: {
        ...parentData,
        isActive: true,
      },
    })

    categoryMap.set(parent.slug, parent.id)
    console.log(`✅ Category: ${parent.nameFr}`)

    for (const childData of children) {
      const child = await prisma.category.upsert({
        where: { slug: childData.slug },
        update: {
          nameFr: childData.nameFr,
          nameAr: childData.nameAr,
          imageUrl: null,
          sortOrder: childData.sortOrder,
          parentId: parent.id,
          isActive: true,
        },
        create: {
          ...childData,
          parentId: parent.id,
          isActive: true,
        },
      })

      categoryMap.set(child.slug, child.id)
      console.log(`  └─ Subcategory: ${child.nameFr}`)
    }
  }

  // Find all leaf categories (categories with no children)
  const allCategories = await prisma.category.findMany({
    include: {
      children: {
        select: { id: true },
      },
    },
    where: {
      isActive: true,
    },
  })

  const leafCategories = allCategories.filter((cat) => cat.children.length === 0)
  console.log(`\n📊 Found ${leafCategories.length} leaf categories to populate\n`)

  let totalCreated = 0
  let totalUpdated = 0
  const missingSections: string[] = []

  // Seed products for each leaf category
  for (const category of leafCategories) {
    const categorySlug = category.slug.toLowerCase()
    let templates = PRODUCT_TEMPLATES[categorySlug]

    // If no template found, generate fallback products
    if (!templates) {
      templates = generateFallbackProducts(category.nameFr, categorySlug)
      missingSections.push(`${category.nameFr} (${categorySlug})`)
    }

    console.log(`📦 Processing: ${category.nameFr} (${categorySlug})`)

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i]
      const slug = generateSlug(template.nameFr, template.brand, template.size, categorySlug, i + 1)

      // Ensure slug is unique by appending a number if needed
      let finalSlug = slug
      let counter = 1
      while (true) {
        const existing = await prisma.product.findUnique({
          where: { slug: finalSlug },
        })

        if (!existing || existing.categoryId === category.id) {
          break
        }

        finalSlug = `${slug}-${counter}`
        counter++
      }

      // Upsert product by slug
      const product = await prisma.product.upsert({
        where: { slug: finalSlug },
        update: {
          nameFr: template.nameFr,
          description: template.description,
          price: template.price,
          stock: 50,
          isActive: true,
          imageUrl: `https://via.placeholder.com/400x400?text=${encodeURIComponent(template.nameFr)}`,
        },
        create: {
          nameFr: template.nameFr,
          slug: finalSlug,
          description: template.description,
          price: template.price,
          categoryId: category.id,
          stock: 50,
          isActive: true,
          imageUrl: `https://via.placeholder.com/400x400?text=${encodeURIComponent(template.nameFr)}`,
        },
      })

      // Check if it was created or updated
      const wasCreated = product.createdAt.getTime() === product.updatedAt.getTime()
      if (wasCreated) {
        totalCreated++
      } else {
        totalUpdated++
      }
    }

    console.log(`   ✓ Added ${templates.length} products`)
  }

  // Verification: Check that each leaf category has at least 4 products
  console.log("\n🔍 Verifying seed results...")
  const verificationErrors: string[] = []

  for (const category of leafCategories) {
    const productCount = await prisma.product.count({
      where: {
        categoryId: category.id,
        isActive: true,
      },
    })

    if (productCount < 4) {
      verificationErrors.push(`${category.nameFr} (${category.slug}): only ${productCount} products`)
    }
  }

  if (verificationErrors.length > 0) {
    console.error("\n❌ Verification failed! Some categories have fewer than 4 products:")
    verificationErrors.forEach((error) => console.error(`   - ${error}`))
    throw new Error("Seed verification failed")
  }

  // Print summary
  console.log("\n✅ Seed verification passed!")
  console.log(`\n📊 Summary:`)
  console.log(`   - Leaf categories: ${leafCategories.length}`)
  console.log(`   - Products created: ${totalCreated}`)
  console.log(`   - Products updated: ${totalUpdated}`)
  console.log(`   - Total products: ${totalCreated + totalUpdated}`)
  
  if (missingSections.length > 0) {
    console.log(`\n⚠️  Categories with generated fallback products (${missingSections.length}):`)
    missingSections.forEach((section) => console.log(`   - ${section}`))
  }

  console.log("\n🎉 Seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
