# Reusable Export Reports Guide (PDF, Excel, Word)

This guide documents how to use the `ReportService` class to export high-quality reports in PDF, Excel, and Word formats. All functions are designed to be completely reusable across any controller or class in the application.

---

## Service Class Location
- [ReportService.php](file:///c:/My-Document/App/leaning-code/hadiri/baseApp/app/Services/ReportService.php)

---

## 1. Export PDF (`ReportService::generatePdf`)

Renders a Blade template to a PDF binary and triggers a download.

### Method Signature
```php
public static function generatePdf(
    string $view, 
    array $data, 
    string $filename = 'report.pdf', 
    array $options = []
)
```

### Parameters
* **`$view`** *(string)*: The name of the blade template (e.g. `'reports.template'`).
* **`$data`** *(array)*: Association array of data sent to the blade file.
* **`$filename`** *(string)*: Output file name.
* **`$options`** *(array)*: Layout settings:
  * `'paper'`: `'a4'` (default), `'letter'`, `'legal'`, etc.
  * `'orientation'`: `'portrait'` (default) or `'landscape'`.

### Developer Example
```php
use App\Services\ReportService;

public function downloadUserPdf() {
    $data = [
        'title' => 'Monthly Sales Report',
        'logoUrl' => 'data:image/png;base64,iVBORw0KGg...', // Base64 logo
        'headers' => ['Product', 'Amount', 'Date'],
        'rows' => [
            ['Product A', '$150.00', '2026-07-27'],
            ['Product B', '$450.00', '2026-07-26']
        ]
    ];

    return ReportService::generatePdf('reports.template', $data, 'sales.pdf');
}
```

### Customizing Logo & CSS
* **Images in Dompdf**: Dompdf works best when images are provided as **Base64 encoded strings** (e.g. `data:image/png;base64,...`) instead of relative file paths, which can fail to resolve in some environment configurations.
* **CSS Page Break**: To push content to a new page in your Blade template, use:
  ```html
  <div style="page-break-after: always;"></div>
  ```

---

## 2. Export Excel (`ReportService::generateExcel`)

Generates a spreadsheet table with auto-adjusted column widths and styling headers.

### Method Signature
```php
public static function generateExcel(
    array $headers, 
    array $rows, 
    string $filename = 'report.xlsx', 
    string $sheetName = 'Report'
)
```

### Parameters
* **`$headers`** *(array)*: Column headers (single-dimension list).
* **`$rows`** *(array)*: Tabular content (two-dimension list).
* **`$filename`** *(string)*: Output file name.
* **`$sheetName`** *(string)*: Tab name inside the Excel file.

### Developer Example
```php
use App\Services\ReportService;

public function downloadExcel() {
    $headers = ['ID', 'Full Name', 'Status'];
    $rows = [
        [1, 'Alice Smith', 'Active'],
        [2, 'Bob Johnson', 'Pending']
    ];

    return ReportService::generateExcel($headers, $rows, 'customers.xlsx', 'Customers');
}
```

---

## 3. Export Word Document (`ReportService::generateWord`)

Generates structured Word documents with custom page margins, paragraphs, styles, and tables.

### Method Signature
```php
public static function generateWord(
    string $title, 
    array $sections, 
    string $filename = 'report.docx', 
    array $options = []
)
```

### Parameters
* **`$title`** *(string)*: Main document header.
* **`$sections`** *(array)*: List of structural document blocks. Supported block formats:
  * **Text Block**:
    ```php
    [
        'type' => 'text',
        'text' => 'Your text content here...',
        'style' => ['bold' => true, 'italic' => false, 'size' => 12, 'color' => '1E293B', 'spaceAfter' => 120]
    ]
    ```
  * **Table Block**:
    ```php
    [
        'type' => 'table',
        'headers' => ['Col 1', 'Col 2'],
        'rows' => [
            ['Row 1 Col 1', 'Row 1 Col 2'],
            ['Row 2 Col 1', 'Row 2 Col 2']
        ]
    ]
    ```
* **`$filename`** *(string)*: Output file name.
* **`$options`** *(array)*: Margin values in twips (1 inch = 1440 twips).
  * `'marginTop'`, `'marginBottom'`, `'marginLeft'`, `'marginRight'`.

### Developer Example
```php
use App\Services\ReportService;

public function downloadWordDoc() {
    $sections = [
        [
            'type' => 'text',
            'text' => 'This is a custom paragraph in the exported document.',
            'style' => ['italic' => true]
        ],
        [
            'type' => 'table',
            'headers' => ['Task Name', 'Assignee'],
            'rows' => [
                ['Implement API endpoints', 'Sarah'],
                ['Configure CI/CD Pipelines', 'Alex']
            ]
        ]
    ];

    return ReportService::generateWord('Project Status Update', $sections, 'project_report.docx');
}
```
