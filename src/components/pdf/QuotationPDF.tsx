'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Registrar fuente (opcional, usa Helvetica por defecto)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf' },
  ],
});

// Colores de marca AMAROT
const colors = {
  primary: '#1E3A8A',    // Azul AMAROT
  accent: '#DC2626',     // Rojo AMAROT
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  black: '#111827',
  white: '#FFFFFF',
};

// Estilos del documento
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 30,
    paddingBottom: 60,
    paddingHorizontal: 40,
    backgroundColor: colors.white,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  logo: {
    width: 120,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  logoSubtext: {
    fontSize: 8,
    color: colors.gray,
  },
  quotationInfo: {
    textAlign: 'right',
  },
  quotationCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  quotationDate: {
    fontSize: 9,
    color: colors.gray,
    marginTop: 4,
  },
  // Client section
  clientSection: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  clientBox: {
    flex: 1,
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 4,
    marginRight: 10,
  },
  companyBox: {
    flex: 1,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  clientName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  clientDetail: {
    fontSize: 9,
    color: colors.gray,
    marginBottom: 2,
  },
  // Table
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  tableHeaderText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 9,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 6,
    minHeight: 35,
  },
  tableRowAlt: {
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    fontSize: 9,
  },
  colDescription: { width: '45%' },
  colQty: { width: '10%', textAlign: 'center' },
  colUnit: { width: '10%', textAlign: 'center' },
  colUnitPrice: { width: '17%', textAlign: 'right' },
  colTotal: { width: '18%', textAlign: 'right' },
  // Totals section
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  totalsBox: {
    width: 220,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: colors.gray,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  totalFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },
  totalFinalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.black,
  },
  totalFinalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.accent,
  },
  // Conditions
  conditionsSection: {
    marginTop: 25,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  conditionsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  conditionItem: {
    width: '50%',
    marginBottom: 8,
  },
  conditionLabel: {
    fontSize: 8,
    color: colors.gray,
    marginBottom: 2,
  },
  conditionValue: {
    fontSize: 9,
    color: colors.black,
  },
  // Notes
  notesSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.gray,
    marginBottom: 5,
  },
  notesText: {
    fontSize: 9,
    color: colors.black,
    lineHeight: 1.4,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: colors.gray,
  },
  footerPage: {
    fontSize: 8,
    color: colors.gray,
  },
});

// Helper para formatear moneda
function formatCurrency(amount: number, currency: 'PEN' | 'USD' = 'PEN'): string {
  const symbol = currency === 'PEN' ? 'S/' : '$';
  return `${symbol} ${amount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Tipos
export interface QuotationPDFData {
  code: string;
  createdAt: string;
  validityDays: number;
  validityDate: string | null;
  paymentTerms: string | null;
  notes: string | null;
  subtotal: number;
  igv: number;
  total: number;
  currency: 'PEN' | 'USD';
  client: {
    companyName: string;
    contactName: string;
    contactEmail: string | null;
    contactPhone: string;
    ruc: string | null;
    address: string | null;
  } | null;
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    diameter?: number | null;
    depth?: number | null;
    workingHeight?: number | null;
  }>;
}

interface QuotationPDFProps {
  data: QuotationPDFData;
}

export default function QuotationPDF({ data }: QuotationPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>AMAROT</Text>
            <Text style={styles.logoSubtext}>Servicios de Perforación</Text>
          </View>
          <View style={styles.quotationInfo}>
            <Text style={styles.quotationCode}>{data.code}</Text>
            <Text style={styles.quotationDate}>
              Fecha: {new Date(data.createdAt).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Client & Company Info */}
        <View style={styles.clientSection}>
          <View style={styles.clientBox}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            {data.client ? (
              <>
                <Text style={styles.clientName}>{data.client.companyName}</Text>
                <Text style={styles.clientDetail}>Attn: {data.client.contactName}</Text>
                {data.client.ruc && (
                  <Text style={styles.clientDetail}>RUC: {data.client.ruc}</Text>
                )}
                <Text style={styles.clientDetail}>Tel: {data.client.contactPhone}</Text>
                {data.client.contactEmail && (
                  <Text style={styles.clientDetail}>{data.client.contactEmail}</Text>
                )}
                {data.client.address && (
                  <Text style={styles.clientDetail}>{data.client.address}</Text>
                )}
              </>
            ) : (
              <Text style={styles.clientDetail}>Sin cliente asignado</Text>
            )}
          </View>
          <View style={styles.companyBox}>
            <Text style={styles.sectionTitle}>AMAROT PERU S.A.C.</Text>
            <Text style={styles.clientDetail}>RUC: 20601234567</Text>
            <Text style={styles.clientDetail}>Jr. Los Tallanes 123, Lima</Text>
            <Text style={styles.clientDetail}>Tel: (01) 234-5678</Text>
            <Text style={styles.clientDetail}>info@amarot.pe</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>Descripción</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Cant.</Text>
            <Text style={[styles.tableHeaderText, styles.colUnit]}>Und.</Text>
            <Text style={[styles.tableHeaderText, styles.colUnitPrice]}>P. Unit</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
          </View>
          {data.items.map((item, index) => (
            <View
              key={index}
              style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <View style={styles.colDescription}>
                <Text style={styles.tableCell}>{item.description}</Text>
                {item.diameter && (
                  <Text style={[styles.tableCell, { color: colors.gray, fontSize: 8 }]}>
                    Ø{item.diameter}" {item.depth && `• ${item.depth}cm`}{' '}
                    {item.workingHeight && item.workingHeight > 2 && `• ${item.workingHeight}m altura`}
                  </Text>
                )}
              </View>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colUnit]}>{item.unit || 'und'}</Text>
              <Text style={[styles.tableCell, styles.colUnitPrice]}>
                {formatCurrency(item.unitPrice, data.currency)}
              </Text>
              <Text style={[styles.tableCell, styles.colTotal, { fontWeight: 'bold' }]}>
                {formatCurrency(item.totalPrice, data.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(data.subtotal, data.currency)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IGV (18%):</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(data.igv, data.currency)}
              </Text>
            </View>
            <View style={styles.totalFinal}>
              <Text style={styles.totalFinalLabel}>TOTAL:</Text>
              <Text style={styles.totalFinalValue}>
                {formatCurrency(data.total, data.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Conditions */}
        <View style={styles.conditionsSection}>
          <Text style={styles.conditionsTitle}>Condiciones</Text>
          <View style={styles.conditionsGrid}>
            <View style={styles.conditionItem}>
              <Text style={styles.conditionLabel}>Validez de la cotización</Text>
              <Text style={styles.conditionValue}>
                {data.validityDays} días
                {data.validityDate && ` (hasta ${new Date(data.validityDate).toLocaleDateString('es-PE')})`}
              </Text>
            </View>
            <View style={styles.conditionItem}>
              <Text style={styles.conditionLabel}>Forma de pago</Text>
              <Text style={styles.conditionValue}>
                {data.paymentTerms || '50% adelanto, 50% contra entrega'}
              </Text>
            </View>
            <View style={styles.conditionItem}>
              <Text style={styles.conditionLabel}>Moneda</Text>
              <Text style={styles.conditionValue}>
                {data.currency === 'PEN' ? 'Soles (PEN)' : 'Dólares (USD)'}
              </Text>
            </View>
            <View style={styles.conditionItem}>
              <Text style={styles.conditionLabel}>Incluye</Text>
              <Text style={styles.conditionValue}>
                IGV (18%)
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notas y Observaciones</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            AMAROT PERU S.A.C. | www.amarot.pe | info@amarot.pe
          </Text>
          <Text
            style={styles.footerPage}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
