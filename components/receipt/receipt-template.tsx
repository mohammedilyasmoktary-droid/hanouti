import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  header: {
    marginBottom: 30,
    borderBottom: "2 solid #22c55e",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: "40%",
    fontWeight: "bold",
    color: "#666",
  },
  value: {
    width: "60%",
    color: "#333",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    fontWeight: "bold",
    borderBottom: "1 solid #e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1 solid #e5e7eb",
  },
  col1: {
    width: "50%",
  },
  col2: {
    width: "15%",
    textAlign: "right",
  },
  col3: {
    width: "15%",
    textAlign: "right",
  },
  col4: {
    width: "20%",
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 15,
    borderTop: "2 solid #22c55e",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22c55e",
  },
  footer: {
    marginTop: 40,
    paddingTop: 15,
    borderTop: "1 solid #e5e7eb",
    textAlign: "center",
    color: "#666",
    fontSize: 8,
  },
})

interface OrderItem {
  id: string
  nameFr: string
  price: number
  quantity: number
}

interface ReceiptData {
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string | null
  deliveryMethod: "DELIVERY" | "PICKUP"
  address?: string | null
  city?: string | null
  status: string
  total: number
  items: OrderItem[]
  createdAt: string
}

interface ReceiptTemplateProps {
  order: ReceiptData
}

export function ReceiptTemplate({ order }: ReceiptTemplateProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const statusLabels: Record<string, string> = {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    PREPARING: "En préparation",
    READY: "Prête",
    DELIVERING: "En livraison",
    DELIVERED: "Livrée",
    CANCELLED: "Annulée",
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Hanouti</Text>
          <Text style={styles.subtitle}>Vos produits frais livrés à domicile</Text>
        </View>

        {/* Order Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facture / Reçu</Text>
          <View style={styles.row}>
            <Text style={styles.label}>N° Commande:</Text>
            <Text style={styles.value}>{order.orderNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Statut:</Text>
            <Text style={styles.value}>{statusLabels[order.status] || order.status}</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations client</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nom:</Text>
            <Text style={styles.value}>{order.customerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Téléphone:</Text>
            <Text style={styles.value}>{order.customerPhone}</Text>
          </View>
          {order.customerEmail && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{order.customerEmail}</Text>
            </View>
          )}
        </View>

        {/* Delivery Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Livraison</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Mode:</Text>
            <Text style={styles.value}>
              {order.deliveryMethod === "DELIVERY" ? "Livraison à domicile" : "Retrait en magasin"}
            </Text>
          </View>
          {order.deliveryMethod === "DELIVERY" && (order.address || order.city) && (
            <>
              {order.address && (
                <View style={styles.row}>
                  <Text style={styles.label}>Adresse:</Text>
                  <Text style={styles.value}>{order.address}</Text>
                </View>
              )}
              {order.city && (
                <View style={styles.row}>
                  <Text style={styles.label}>Ville:</Text>
                  <Text style={styles.value}>{order.city}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Articles commandés</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Article</Text>
              <Text style={styles.col2}>Qté</Text>
              <Text style={styles.col3}>Prix unit.</Text>
              <Text style={styles.col4}>Total</Text>
            </View>
            {/* Table Rows */}
            {order.items.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.col1}>{item.nameFr}</Text>
                <Text style={styles.col2}>{item.quantity}</Text>
                <Text style={styles.col3}>{item.price.toFixed(2)} MAD</Text>
                <Text style={styles.col4}>{(item.price * item.quantity).toFixed(2)} MAD</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{order.total.toFixed(2)} MAD</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Merci pour votre confiance !</Text>
          <Text style={{ marginTop: 5 }}>
            Pour toute question, contactez-nous au +212 XXX XXX XXX ou via contact@hanouti.ma
          </Text>
        </View>
      </Page>
    </Document>
  )
}

