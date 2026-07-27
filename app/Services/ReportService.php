<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportService
{
    /**
     * Generate and download a PDF document using a Blade template.
     *
     * @param string $view Blade view path (e.g., 'reports.template')
     * @param array $data Data variables passed to the view
     * @param string $filename Name of the downloaded file
     * @param array $options Optional PDF configurations (paper size, orientation)
     * @return \Illuminate\Http\Response
     */
    public static function generatePdf(string $view, array $data, string $filename = 'report.pdf', array $options = [])
    {
        $paperSize = $options['paper'] ?? 'a4';
        $orientation = $options['orientation'] ?? 'portrait'; // portrait or landscape

        $pdf = Pdf::loadView($view, $data);
        $pdf->setPaper($paperSize, $orientation);

        return $pdf->download($filename);
    }

    /**
     * Generate and download an Excel spreadsheet report.
     *
     * @param array $headers Single-dimension array of column headers (e.g. ['ID', 'Name', 'Email'])
     * @param array $rows Two-dimension array of row data
     * @param string $filename Name of the downloaded file
     * @param string $sheetName Name of the sheet tab inside Excel
     * @return StreamedResponse
     */
    public static function generateExcel(array $headers, array $rows, string $filename = 'report.xlsx', string $sheetName = 'Report'): StreamedResponse
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle($sheetName);

        // 1. Write headers
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . '1', $header);
            
            // Apply header styling
            $sheet->getStyle($col . '1')->getFont()->setBold(true);
            $sheet->getStyle($col . '1')->getFill()
                ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                ->getStartColor()->setARGB('F1F5F9'); // Cool grey background
            
            $col++;
        }

        // 2. Write data rows
        $rowNum = 2;
        foreach ($rows as $row) {
            $col = 'A';
            foreach ($row as $value) {
                $sheet->setCellValue($col . $rowNum, $value);
                $col++;
            }
            $rowNum++;
        }

        // 3. Auto-adjust column widths
        $lastCol = $sheet->getHighestColumn();
        for ($col = 'A'; $col !== $lastCol; $col++) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        $sheet->getColumnDimension($lastCol)->setAutoSize(true); // Adjust last col

        // 4. Return stream response
        $writer = new Xlsx($spreadsheet);
        
        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * Generate and download a Word (.docx) document report.
     *
     * @param string $title Document Title / Header
     * @param array $sections Content blocks. Each block can contain:
     *                        ['type' => 'text', 'text' => '...', 'style' => [...]] OR
     *                        ['type' => 'table', 'headers' => [...], 'rows' => [...]]
     * @param string $filename Name of the downloaded file
     * @param array $options Layout styling options
     * @return StreamedResponse
     */
    public static function generateWord(string $title, array $sections, string $filename = 'report.docx', array $options = []): StreamedResponse
    {
        $phpWord = new PhpWord();

        // Add default font properties
        $phpWord->setDefaultFontName('Arial');
        $phpWord->setDefaultFontSize(11);

        $section = $phpWord->addSection([
            'marginTop' => $options['marginTop'] ?? 1440, // 1 inch = 1440 twips
            'marginBottom' => $options['marginBottom'] ?? 1440,
            'marginLeft' => $options['marginLeft'] ?? 1440,
            'marginRight' => $options['marginRight'] ?? 1440,
        ]);

        // Add Document Main Title
        $section->addText($title, [
            'name' => 'Arial',
            'size' => 20,
            'bold' => true,
            'color' => '1E293B' // Slate-800
        ], [
            'spaceAfter' => 240 // 12pt space
        ]);

        // Draw horizontal line divider
        $section->addLine([
            'width' => 100,
            'height' => 1,
            'color' => 'CBD5E1',
            'spaceAfter' => 240
        ]);

        // Build document elements
        foreach ($sections as $element) {
            if ($element['type'] === 'text') {
                $style = $element['style'] ?? [];
                $section->addText($element['text'], [
                    'bold' => $style['bold'] ?? false,
                    'italic' => $style['italic'] ?? false,
                    'size' => $style['size'] ?? 11,
                    'color' => $style['color'] ?? '334155'
                ], [
                    'spaceAfter' => $style['spaceAfter'] ?? 120
                ]);
            } elseif ($element['type'] === 'table') {
                $table = $section->addTable([
                    'borderSize' => 6,
                    'borderColor' => 'CBD5E1',
                    'cellMargin' => 80
                ]);

                // Render Table Headers
                if (!empty($element['headers'])) {
                    $table->addRow();
                    foreach ($element['headers'] as $header) {
                        $table->addCell(2000, ['bgColor' => 'F1F5F9'])->addText($header, ['bold' => true]);
                    }
                }

                // Render Table Rows
                if (!empty($element['rows'])) {
                    foreach ($element['rows'] as $row) {
                        $table->addRow();
                        foreach ($row as $cell) {
                            $table->addCell(2000)->addText($cell);
                        }
                    }
                }

                // Spacing after table
                $section->addTextBreak(1);
            }
        }

        // Detect if zip extension is loaded. Word2007 (.docx) format requires zip.
        $format = extension_loaded('zip') ? 'Word2007' : 'RTF';
        $contentType = $format === 'Word2007' 
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
            : 'application/rtf';

        if ($format === 'RTF' && str_ends_with($filename, '.docx')) {
            $filename = str_replace('.docx', '.rtf', $filename);
        }

        $writer = IOFactory::createWriter($phpWord, $format);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => $contentType,
            'Cache-Control' => 'max-age=0',
        ]);
    }
}
