<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Mutasi Rekening Tabungan</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 10pt; color: #333; margin: 0; padding: 15px 30px; }
        .kop { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
        .kop img { max-height: 55px; margin-bottom: 3px; }
        .kop h3 { margin: 0; font-size: 14pt; text-transform: uppercase; }
        .kop p { margin: 1px 0; font-size: 8pt; color: #555; }
        .title { text-align: center; font-size: 12pt; font-weight: bold; margin: 15px 0 10px; text-transform: uppercase; }
        .period { text-align: center; font-size: 9pt; color: #555; margin-bottom: 20px; }
        
        table.info { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 9pt; }
        table.info td { padding: 4px 6px; vertical-align: top; }
        table.info td.label { width: 120px; font-weight: bold; }
        table.info td.val { width: 300px; }
        table.info td.label2 { width: 100px; font-weight: bold; }
        table.info td.val2 { text-align: right; font-weight: bold; font-size: 11pt; }
        
        table.mutasi { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9pt; }
        table.mutasi th, table.mutasi td { border: 1px solid #ddd; padding: 8px 10px; }
        table.mutasi th { bg-color: #f7f7f7; background-color: #f7f7f7; font-weight: bold; text-align: center; }
        table.mutasi td.amount { text-align: right; font-family: 'Courier New', monospace; }
        .footer { margin-top: 25px; font-size: 8pt; color: #999; text-align: center; border-top: 1px dashed #ccc; padding-top: 10px; }
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

    <div class="title">Laporan Mutasi Rekening Simpanan</div>
    <div class="period">Periode: {{ $start_date }} s/d {{ $end_date }}</div>

    <table class="info">
        <tr>
            <td class="label">No. Rekening</td>
            <td class="val">: {{ $account->account_number }}</td>
            <td class="label2">Saldo Awal</td>
            <td class="val2" style="font-weight: normal; font-size: 9pt;">: Rp {{ number_format($saldo_awal, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="label">Nama Anggota</td>
            <td class="val">: {{ $account->customer->full_name }}</td>
            <td class="label2">Saldo Akhir</td>
            <td class="val2">: Rp {{ number_format($account->balance, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="label">Produk</td>
            <td class="val">: {{ $account->product->name }}</td>
            <td class="label2">CIF</td>
            <td class="val2" style="font-weight: normal; font-size: 9pt;">: {{ $account->customer->cif_number }}</td>
        </tr>
    </table>

    <table class="mutasi">
        <thead>
            <tr>
                <th style="width: 120px;">Tanggal</th>
                <th style="width: 80px;">Sandi/Jenis</th>
                <th>Keterangan</th>
                <th style="width: 110px;">Debit (Rp)</th>
                <th style="width: 110px;">Kredit (Rp)</th>
                <th style="width: 120px;">Saldo (Rp)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="text-align: center;">-</td>
                <td style="text-align: center;">SALDO</td>
                <td>Saldo Awal Periode</td>
                <td class="amount">-</td>
                <td class="amount">-</td>
                <td class="amount">{{ number_format($saldo_awal, 0, ',', '.') }}</td>
            </tr>
            @foreach($transactions->reverse() as $trx)
                @php
                    if($trx->transaction_type === 'DEPOSIT') {
                        $debit = '-';
                        $kredit = number_format($trx->amount, 0, ',', '.');
                    } else {
                        $debit = number_format($trx->amount, 0, ',', '.');
                        $kredit = '-';
                    }
                @endphp
                <tr>
                    <td style="text-align: center;">{{ \Carbon\Carbon::parse($trx->created_at)->format('d/m/Y H:i') }}</td>
                    <td style="text-align: center;">{{ $trx->transaction_type === 'DEPOSIT' ? 'SETOR' : 'TARIK' }}</td>
                    <td>{{ $trx->description }}</td>
                    <td class="amount" style="color: red;">{{ $debit }}</td>
                    <td class="amount" style="color: green;">{{ $kredit }}</td>
                    <td class="amount" style="font-weight: bold;">{{ number_format($trx->balance_after ?? 0, 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Dokumen ini sah dicetak langsung dari sistem BMT-CORE pada {{ now()->format('d/m/Y H:i') }}.
    </div>
</body>
</html>
