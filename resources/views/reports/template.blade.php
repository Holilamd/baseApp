<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title ?? 'Report' }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #334155;
            font-size: 12px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }
        
        .header {
            margin-bottom: 30px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 15px;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-table td {
            vertical-align: middle;
            border: none;
            padding: 0;
        }

        .logo {
            max-height: 60px;
            max-width: 180px;
        }

        .company-info {
            text-align: right;
            font-size: 11px;
            color: #64748b;
        }

        .company-name {
            font-size: 16px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 4px;
        }

        .title-section {
            margin-bottom: 25px;
        }

        h1 {
            font-size: 20px;
            font-weight: bold;
            color: #0f172a;
            margin: 0 0 8px 0;
            letter-spacing: -0.5px;
        }

        .meta-text {
            font-size: 11px;
            color: #64748b;
        }

        .meta-label {
            font-weight: bold;
            color: #475569;
        }

        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        table.data-table th {
            background-color: #f8fafc;
            border-bottom: 2px solid #cbd5e1;
            color: #1e293b;
            font-weight: bold;
            text-align: left;
            padding: 10px 12px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        table.data-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
        }

        table.data-table tr:nth-child(even) {
            background-color: #f8fafc/50;
        }

        .footer {
            position: fixed;
            bottom: -10px;
            left: 0;
            right: 0;
            height: 30px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
            padding-top: 10px;
        }

        .page-number:after {
            content: counter(page);
        }

        .badge {
            display: inline-block;
            padding: 3px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .badge-success {
            background-color: #dcfce7;
            color: #15803d;
        }

        .badge-info {
            background-color: #dbeafe;
            color: #1d4ed8;
        }
    </style>
</head>
<body>

    <!-- Header Section -->
    <div class="header">
        <table class="header-table">
            <tr>
                <td>
                    @if(!empty($logoUrl))
                        <img src="{{ $logoUrl }}" class="logo" alt="Logo">
                    @else
                        <!-- Fallback Text Logo -->
                        <span style="font-size: 22px; font-weight: 900; color: #3b82f6; letter-spacing: -1px;">BMT-CORE</span>
                    @endif
                </td>
                <td class="company-info">
                    <div class="company-name">{{ $tenantName ?? 'BMT-CORE Multi-Tenant' }}</div>
                    <div>Jalan Jenderal Sudirman No. 12, Jakarta</div>
                    <div>support@hadiri.com | +62 21-555-0199</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Title and Metadata Section -->
    <div class="title-section">
        <h1>{{ $title }}</h1>
        <table style="width: 100%; border: none;">
            <tr>
                <td style="padding: 0; border: none;" class="meta-text">
                    <span class="meta-label">Exported By:</span> {{ $exporter ?? 'Administrator' }}
                </td>
                <td style="padding: 0; border: none; text-align: right;" class="meta-text">
                    <span class="meta-label">Date:</span> {{ $date ?? now()->format('d M Y H:i') }}
                </td>
            </tr>
        </table>
    </div>

    <!-- Data Content Table -->
    <table class="data-table">
        <thead>
            <tr>
                @foreach($headers as $header)
                    <th>{{ $header }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($rows as $row)
                <tr>
                    @foreach($row as $cell)
                        <td>{!! $cell !!}</td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Footer Counter -->
    <div class="footer">
        Generated by BMT-CORE Multi-Tenant System &mdash; Page <span class="page-number"></span>
    </div>

</body>
</html>
