<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Akad Pembiayaan</title>
    <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #333; margin: 0; padding: 20px 40px; }
        .kop { text-align: center; border-bottom: 3px double #333; padding-bottom: 15px; margin-bottom: 25px; }
        .kop img { max-height: 60px; margin-bottom: 5px; }
        .kop h2 { margin: 0; font-size: 18pt; text-transform: uppercase; letter-spacing: 2px; }
        .kop p { margin: 2px 0; font-size: 10pt; color: #555; }
        .title { text-align: center; font-size: 14pt; font-weight: bold; text-decoration: underline; margin: 25px 0 15px; }
        .ref { text-align: center; font-size: 10pt; color: #777; margin-bottom: 25px; }
        .section { margin-bottom: 15px; }
        .section-title { font-weight: bold; margin-bottom: 8px; }
        table.info { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        table.info td { padding: 4px 8px; vertical-align: top; font-size: 11pt; }
        table.info td:first-child { width: 180px; font-weight: bold; }
        table.schedule { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10pt; }
        table.schedule th, table.schedule td { border: 1px solid #ccc; padding: 6px 10px; text-align: right; }
        table.schedule th { background-color: #f0f0f0; text-align: center; font-weight: bold; }
        table.schedule td:first-child { text-align: center; }
        .content { line-height: 1.8; text-align: justify; font-size: 11pt; }
        .signature { margin-top: 50px; }
        .signature table { width: 100%; }
        .signature td { width: 50%; text-align: center; vertical-align: top; padding-top: 10px; }
        .signature .line { margin-top: 60px; border-top: 1px solid #333; display: inline-block; width: 200px; }
        .footer { margin-top: 30px; font-size: 9pt; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
    </style>
</head>
<body>
    {{-- Kop Surat --}}
    <div class="kop">
        @if($kop_surat_url)
        <img src="{{ $kop_surat_url }}" alt="Logo">
        @endif
        <h2>{{ $tenant_name }}</h2>
        <p>{{ $tenant_address }}</p>
    </div>

    <div class="title">SURAT PERJANJIAN PEMBIAYAAN</div>
    <div class="ref">No. Ref: {{ $financing->financing_number }}</div>

    <div class="content">
        <p>Pada hari ini, {{ \Carbon\Carbon::now()->translatedFormat('l, d F Y') }}, telah dibuat dan ditandatangani Perjanjian Pembiayaan antara:</p>
    </div>

    <div class="section">
        <div class="section-title">PIHAK PERTAMA (Pemberi Pembiayaan):</div>
        <table class="info">
            <tr><td>Nama Lembaga</td><td>: {{ $tenant_name }}</td></tr>
            <tr><td>Diwakili oleh</td><td>: {{ $manager_name }}</td></tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">PIHAK KEDUA (Penerima Pembiayaan):</div>
        <table class="info">
            <tr><td>Nama Lengkap</td><td>: {{ $financing->customer->full_name }}</td></tr>
            <tr><td>No. CIF</td><td>: {{ $financing->customer->cif_number }}</td></tr>
            <tr><td>NIK</td><td>: {{ $financing->customer->identity_number }}</td></tr>
            <tr><td>Alamat</td><td>: {{ $financing->customer->address ?? '-' }}</td></tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">KETENTUAN PEMBIAYAAN:</div>
        <table class="info">
            <tr><td>Produk Pembiayaan</td><td>: {{ $financing->product->name }}</td></tr>
            <tr><td>Plafon (Pokok)</td><td>: Rp {{ number_format($financing->amount, 0, ',', '.') }}</td></tr>
            <tr><td>Margin ({{ $financing->margin_rate }}% p.a)</td><td>: Rp {{ number_format($financing->total_margin, 0, ',', '.') }}</td></tr>
            <tr><td>Total Kewajiban</td><td>: <strong>Rp {{ number_format($financing->total_payment, 0, ',', '.') }}</strong></td></tr>
            <tr><td>Jangka Waktu</td><td>: {{ $financing->duration_months }} Bulan</td></tr>
            <tr><td>Metode Perhitungan</td><td>: {{ $financing->product->calculation_method ?? 'FLAT' }}</td></tr>
            <tr><td>Angsuran Per Bulan</td><td>: <strong>Rp {{ number_format($financing->total_payment / $financing->duration_months, 0, ',', '.') }}</strong></td></tr>
        </table>
    </div>

    @if($financing->schedules && $financing->schedules->count() > 0)
    <div class="section">
        <div class="section-title">JADWAL ANGSURAN:</div>
        <table class="schedule">
            <thead>
                <tr>
                    <th>Ke</th>
                    <th>Jatuh Tempo</th>
                    <th>Pokok (Rp)</th>
                    <th>Margin (Rp)</th>
                    <th>Total (Rp)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($financing->schedules as $sch)
                <tr>
                    <td>{{ $sch->installment_number }}</td>
                    <td style="text-align:center">{{ \Carbon\Carbon::parse($sch->due_date)->format('d/m/Y') }}</td>
                    <td>{{ number_format($sch->principal_amount, 0, ',', '.') }}</td>
                    <td>{{ number_format($sch->margin_amount, 0, ',', '.') }}</td>
                    <td>{{ number_format($sch->total_amount, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    @if($financing->notes)
    <div class="section">
        <div class="section-title">CATATAN:</div>
        <p class="content">{{ $financing->notes }}</p>
    </div>
    @endif

    <div class="content" style="margin-top: 20px;">
        <p>Demikian Perjanjian Pembiayaan ini dibuat dan ditandatangani oleh kedua belah pihak dalam keadaan sadar dan tanpa paksaan dari pihak manapun.</p>
    </div>

    <div class="signature">
        <table>
            <tr>
                <td>
                    <p><strong>PIHAK PERTAMA</strong></p>
                    <p>{{ $tenant_name }}</p>
                    <div class="line"></div>
                    <p><strong>{{ $manager_name }}</strong></p>
                </td>
                <td>
                    <p><strong>PIHAK KEDUA</strong></p>
                    <p>Penerima Pembiayaan</p>
                    <div class="line"></div>
                    <p><strong>{{ $financing->customer->full_name }}</strong></p>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Dokumen ini dicetak secara otomatis oleh Sistem BMT-CORE pada {{ now()->format('d/m/Y H:i') }}.
    </div>
</body>
</html>
