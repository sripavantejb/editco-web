import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function downloadInvoicePdf(
  element: HTMLElement,
  filenameBase: string
) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
  const w = canvas.width * ratio;
  const h = canvas.height * ratio;
  const x = (pageWidth - w) / 2;
  const y = 0;
  pdf.addImage(imgData, "PNG", x, y, w, h);
  const safe = filenameBase.replace(/[^\w.-]+/g, "-") || "invoice";
  pdf.save(`${safe}.pdf`);
}
