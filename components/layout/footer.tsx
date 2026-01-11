import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-zinc-50 border-t border-zinc-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-bold text-lg mb-4 text-zinc-900">Hanouti</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Vos produits frais livrés à domicile
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-zinc-900">Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/categories" className="text-zinc-600 hover:text-primary transition-colors">
                  Catégories
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-zinc-600 hover:text-primary transition-colors">
                  Rechercher
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-zinc-900">Aide</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/my-receipt" className="text-zinc-600 hover:text-primary transition-colors">
                  Ma commande
                </Link>
              </li>
              <li>
                <Link href="/locations" className="text-zinc-600 hover:text-primary transition-colors">
                  Nos magasins
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-zinc-600 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-zinc-900">Suivez-nous</h4>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Restez connecté avec nous sur nos réseaux sociaux
            </p>
          </div>
        </div>
        <div className="border-t border-zinc-200 mt-10 pt-8 text-center">
          <p className="text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} Hanouti. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
