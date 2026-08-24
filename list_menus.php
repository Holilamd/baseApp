<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$menus = App\Models\Menu::orderBy('parent_id')->orderBy('order')->get();
foreach($menus as $m) {
    echo $m->id . ' - ' . ($m->parent_id ? '  Child of ' . $m->parent_id . ': ' : '') . $m->name . ' (' . $m->url . ")\n";
}
