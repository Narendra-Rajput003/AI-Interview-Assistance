import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';
import { extractCandidateInfoWithAI } from './geminiService';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function extractResumeText(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    return extractPDFText(file);
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractDOCXText(file);
  } else {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

async function extractPDFText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Limit pages to first 5 for performance (most resumes are short)
    const maxPages = Math.min(pdf.numPages, 5);

    // Process pages in parallel for better performance
    const pagePromises = [];
    for (let i = 1; i <= maxPages; i++) {
      pagePromises.push(
        pdf.getPage(i).then(page =>
          page.getTextContent().then(textContent =>
            textContent.items
              .map((item: unknown) => {
                const textItem = item as { str?: string };
                return textItem.str || '';
              })
              .filter(str => str)
              .join(' ')
          )
        )
      );
    }

    const pageTexts = await Promise.all(pagePromises);
    return pageTexts.join('\n').trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

async function extractDOCXText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

export async function extractCandidateInfo(text: string): Promise<{ name?: string; email?: string; phone?: string }> {
  try {
    return await extractCandidateInfoWithAI(text);
  } catch (error) {
    console.warn('AI extraction failed, proceeding without extracted info:', error);
    return {};
  }
}