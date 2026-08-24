<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$role = App\Models\Role::find(1);

$inq = App\Models\Menu::where('name', 'Inquiries')->first();
$savInq = App\Models\Menu::where('name', 'Savings Inquiry')->first();
$set = App\Models\Menu::where('name', 'Global Settings')->first();
$br = App\Models\Menu::where('name', 'Branch Operations')->first();

if($inq && $savInq && $set && $br) {
    $role->menus()->syncWithoutDetaching([$inq->id, $savInq->id, $set->id, $br->id]);
    echo "Menus attached to role 1\n";
} else {
    echo "Could not find one or more menus\n";
}
