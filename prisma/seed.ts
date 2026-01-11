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

const productTemplates: Record<string, Array<{
  nameFr: string
  nameAr: string
  slugSuffix: string
  description: string
  price: number
  stock: number
  imageUrl: string
}>> = {}

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

  await prisma.orderItem.deleteMany({})
  await prisma.product.deleteMany({})
  console.log("🧹 Cleared existing products")

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

  const allCategories = await prisma.category.findMany({
    include: {
      children: {
        select: { id: true },
      },
    },
  })

  const leafCategories = allCategories.filter((cat) => cat.children.length === 0)
  const totalCategories = allCategories.length

  console.log(`\n📊 Categories: ${totalCategories} total, ${leafCategories.length} leaf categories`)
  console.log("🎉 Seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
