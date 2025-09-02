<?php
// /api/webpay/receipts-by-transaction.php
date_default_timezone_set('America/Santiago');

function json_response($arr, $code=200) {
  http_response_code($code);
  header('Content-Type: application/json');
  header('Cache-Control: no-store');
  echo json_encode($arr, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
  exit;
}

$input = file_get_contents('php://input');
$body = json_decode($input, true);
if (!is_array($body)) $body = [];

$token_ws = isset($body['token_ws']) ? trim($body['token_ws']) : (isset($_GET['token_ws']) ? trim($_GET['token_ws']) : '');
$buy_order= isset($body['buy_order'])? trim($body['buy_order']) : (isset($_GET['buy_order'])? trim($_GET['buy_order']) : '');

if (!$token_ws && !$buy_order) {
  json_response(["ok"=>false,"error"=>"Falta token_ws o buy_order"], 400);
}

$txn_id = $token_ws ? $token_ws : ('BK-'.substr($buy_order ?: 'UNKNOWN',0,8));
$receipt = [
  "txn_id"     => $txn_id,
  "payment_id" => $txn_id,
  "buy_order"  => $buy_order ?: ('BK-'.substr($txn_id,0,6)),
  "status"     => "AUTHORIZED",
  "amount"     => 0,
  "currency"   => "CLP",
  "created_at" => date('c'),
];

json_response(["ok"=>true, "receipt"=>$receipt]);
