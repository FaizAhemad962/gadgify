import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InvoiceItem {
  product: { name: string };
  quantity: number;
  price: number;
}

interface InvoiceOrder {
  id: string;
  createdAt: string;
  subtotal?: number | null;
  shipping?: number | null;
  discount?: number | null;
  couponCode?: string | null;
  total: number;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: InvoiceItem[];
}

export const generateInvoicePDF = (order: InvoiceOrder) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("GADGIFY", 14, 22);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Electronics Store - Maharashtra, India", 14, 28);

  // Invoice title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("INVOICE", pageWidth - 14, 22, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Order #${order.id.slice(0, 8).toUpperCase()}`, pageWidth - 14, 28, {
    align: "right",
  });
  doc.text(
    `Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`,
    pageWidth - 14,
    34,
    { align: "right" },
  );

  // Line
  doc.setDrawColor(200);
  doc.line(14, 40, pageWidth - 14, 40);

  // Ship To
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Ship To:", 14, 50);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);
  const addr = order.shippingAddress;
  doc.text(addr.name, 14, 56);
  doc.text(addr.phone, 14, 61);
  doc.text(addr.address, 14, 66);
  doc.text(`${addr.city}, ${addr.state} - ${addr.pincode}`, 14, 71);

  // Items table
  const tableData = order.items.map((item, i) => [
    i + 1,
    item.product.name,
    item.quantity,
    `Rs.${item.price.toLocaleString("en-IN")}`,
    `Rs.${(item.price * item.quantity).toLocaleString("en-IN")}`,
  ]);

  autoTable(doc, {
    startY: 80,
    head: [["#", "Product", "Qty", "Unit Price", "Total"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [25, 118, 210],
      textColor: 255,
      fontStyle: "bold",
    },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 18, halign: "center" },
      3: { cellWidth: 35, halign: "right" },
      4: { cellWidth: 35, halign: "right" },
    },
  });

  // Summary
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || 140;
  const summaryX = pageWidth - 70;
  let y = finalY + 12;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);

  if (order.subtotal != null) {
    doc.text("Subtotal:", summaryX, y);
    doc.text(
      `Rs.${order.subtotal.toLocaleString("en-IN")}`,
      pageWidth - 14,
      y,
      { align: "right" },
    );
    y += 6;
  }

  if (order.shipping != null) {
    doc.text("Shipping:", summaryX, y);
    doc.text(
      order.shipping === 0
        ? "FREE"
        : `Rs.${order.shipping.toLocaleString("en-IN")}`,
      pageWidth - 14,
      y,
      { align: "right" },
    );
    y += 6;
  }

  if (order.discount && order.discount > 0) {
    doc.text(
      `Discount${order.couponCode ? ` (${order.couponCode})` : ""}:`,
      summaryX,
      y,
    );
    doc.text(
      `-Rs.${order.discount.toLocaleString("en-IN")}`,
      pageWidth - 14,
      y,
      { align: "right" },
    );
    y += 6;
  }

  // Total line
  doc.setDrawColor(200);
  doc.line(summaryX, y, pageWidth - 14, y);
  y += 6;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Total:", summaryX, y);
  doc.text(`Rs.${order.total.toLocaleString("en-IN")}`, pageWidth - 14, y, {
    align: "right",
  });

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text(
    "Thank you for shopping with Gadgify!",
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" },
  );

  // Save
  doc.save(`gadgify-invoice-${order.id.slice(0, 8)}.pdf`);
};
