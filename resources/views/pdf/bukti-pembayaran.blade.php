<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bukti Pembayaran</title>
    <style>
        body { font-family: 'Courier New', monospace; font-size: 10pt; color: #333; margin: 0; padding: 15px 30px; }
        .kop { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
        .kop img { max-height: 40px; margin-bottom: 3px; }
        .kop h3 { margin: 0; font-size: 13pt; text-transform: uppercase; }
        .kop p { margin: 1px 0; font-size: 8pt; color: #555; }
        .title { text-align: center; font-size: 11pt; font-weight: bold; margin: 10px 0 5px; border: 1px dashed #999; padding: 5px; }
        .info-row { display: flex; justify-content: space-between; padding: 2px 0; }
        .info-row .label { font-weight: bold; }
        table.receipt { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 9pt; }
        table.receipt td { padding: 3px 5px; }
        table.receipt td:first-child { width: 140px; }
        table.receipt td:last-child { text-align: right; }
        .divider { border-top: 1px dashed #999; margin: 8px 0; }
        .total { font-size: 12pt; font-weight: bold; text-align: right; }
        .footer { margin-top: 15px; font-size: 8pt; color: #999; text-align: center; }
    </style>
</head>
<body>
    <div class="kop">
        @if($kop_surat_url)
        <img src="{{ $kop_surat_url }}" alt="Logo">
        @endif
        <h3>{{ $tenant_name }}</h3>
        <p>{{ $tenant_address }}</p>
    </div>

    <div class="title">BUKTI {{ $type === 'INSTALLMENT' ? 'PEMBAYARAN ANGSURAN' : 'PELUNASAN PEMBIAYAAN' }}</div>

    <table class="receipt">
        <tr><td>No. Ref</td><td>: {{ $payment->financing->financing_number }}</td></tr>
        <tr><td>Tanggal</td><td>: {{ $payment->payment_date->format('d/m/Y H:i') }}</td></tr>
        <tr><td>Nama Anggota</td><td>: {{ $payment->financing->customer->full_name }}</td></tr>
        <tr><td>Produk</td><td>: {{ $payment->financing->product->name }}</td></tr>
    </table>

    <div class="divider"></div>

    <table class="receipt">
        <tr><td>Pokok Dibayar</td><td>Rp {{ number_format($payment->principal_paid, 0, ',', '.') }}</td></tr>
        <tr><td>Margin Dibayar</td><td>Rp {{ number_format($payment->margin_paid, 0, ',', '.') }}</td></tr>
        @if($payment->penalty_paid > 0)
        <tr><td>Denda</td><td>Rp {{ number_format($payment->penalty_paid, 0, ',', '.') }}</td></tr>
        @endif
        @if(isset($muqasah) && $muqasah > 0)
        <tr><td>Potongan Muqasah</td><td style="color: green;">- Rp {{ number_format($muqasah, 0, ',', '.') }}</td></tr>
        @endif
    </table>

    <div class="divider"></div>
    <div class="total">TOTAL: Rp {{ number_format($payment->amount_paid, 0, ',', '.') }}</div>
    <div class="divider"></div>

    <table class="receipt">
        <tr><td>Sisa Pokok</td><td>Rp {{ number_format($remaining_principal, 0, ',', '.') }}</td></tr>
        <tr><td>Status</td><td>{{ $financing_status }}</td></tr>
        <tr><td>Teller</td><td>{{ $teller_name }}</td></tr>
    </table>

    <div class="footer">
        Terima kasih atas kepercayaan Anda.<br>
        Dicetak oleh BMT-CORE pada {{ now()->format('d/m/Y H:i') }}.
    </div>
</body>
</html>
