const PDFDocument = require('pdfkit');
const ReadingList = require('../models/ReadingList');
const Book = require('../models/Book');

exports.exportSummary = async (req, res) => {
  const entries = await ReadingList.find({ user: req.user.id }).populate('book');
  const summaryLines = entries.map((item) => `${item.book?.title || 'Unknown'} - ${item.status} (${item.progress || 0}% )`);
  const payload = summaryLines.join('\n');

  if (req.query.format === 'pdf') {
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reading-summary.pdf"');
    doc.pipe(res);
    doc.fontSize(18).text('Reading Summary', { underline: true });
    doc.moveDown();
    summaryLines.forEach((line) => doc.fontSize(12).text(line));
    doc.end();
  } else {
    res.setHeader('Content-Type', 'text/plain');
    res.send(payload || 'No entries found');
  }
};
