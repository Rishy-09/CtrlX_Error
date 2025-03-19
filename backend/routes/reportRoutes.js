import express from "express"
import PDFDocument from "pdfkit"
import { createObjectCsvWriter } from "csv-writer"
import Bug from "../models/Bug.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router();


// Exporting Bug Reports as PDF
router.get("/pdf", authMiddleware, async (req, res) => {
  try {
    const bugs = await Bug.find(); // Fetch all bugs
    console.log("Number of bugs fetched for PDF:", bugs.length);

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=bug-report.pdf");

    doc.pipe(res);
    doc.fontSize(18).text("Bug Tracking Report", { align: "center" });
    doc.moveDown();

    bugs.forEach((bug, index) => {
      doc.fontSize(12).text(`${index + 1}. ${bug.title}`, { continued: true });
      doc.text(` - Status: ${bug.status}, Severity: ${bug.severity}, Priority: ${bug.priority}`);
      doc.moveDown();
    });

    doc.end();
  }

  catch (err) {
    res.status(500).json({ message: "Error generating PDF", error: err.message });
  }
});

// Export Bug Reports as CSV
router.get("/csv", authMiddleware, async (req, res) => {
  try {
    const bugs = await Bug.find();
    console.log("Number of bugs fetched for CSV:", bugs.length);

    const csvWriter = createObjectCsvWriter({
      path: "bug-report.csv",
      header: [
        { id: "title", title: "Title" },
        { id: "status", title: "Status" },
        { id: "severity", title: "Severity" },
        { id: "priority", title: "Priority" },
        { id: "createdAt", title: "Reported On" }
      ]
    });

    await csvWriter.writeRecords(
      bugs.map(bug => ({
        title: bug.title,
        status: bug.status,
        severity: bug.severity,
        priority: bug.priority,
        createdAt: bug.createdAt.toISOString()
      }))
    );

    res.download("bug-report.csv");
  } catch (err) {
    res.status(500).json({ message: "Error generating CSV", error: err.message });
  }
});

export default router
