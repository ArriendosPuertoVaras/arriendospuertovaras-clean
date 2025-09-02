<?php
// /api/webpay/return-callback.php
date_default_timezone_set('America/Santiago');

function json_response($arr, $code=200) {
  http_response_code($code);
  header('Content-Type: application/json');
  header('Cache-Control: no-store');
  echo json_encode($arr, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
  exit;
}

$token_ws = isset($_GET['token_ws']) ? trim($_GET['token_ws']) : '';
$tbk_token = isset($_GET['tbk_token']) ? trim($_GET['tbk_token']) : '';
$buy_order = isset($_GET['buy_order']) ? trim($_GET['buy_order']) : '';
$bookingId = isset($_GET['bookingId']) ? trim($_GET['bookingId']) : '';
$status    = isset($_GET['status']) ? trim($_GET['status']) : '';
$evidence  = isset($_GET['evidence']) ? $_GET['evidence'] === '1' : false;

if ($evidence) {
  json_response([
    "ok" => true,
    "received" => [
      "token_ws" => $token_ws,
      "tbk_token"=> $tbk_token,
      "buy_order"=> $buy_order,
      "bookingId"=> $bookingId,
      "status"   => $status,
    ],
    "at" => date('c'),
  ]);
}

$baseUrl = 'https://tudominio.cl'; // <-- CAMBIA esto a tu dominio real
$qs = [];
if ($token_ws) $qs['txn'] = $token_ws;
if ($bookingId) $qs['bookingId'] = $bookingId;
if ($status)    $qs['status'] = $status;
$qs['ok'] = $token_ws ? '1' : '0';

$target = $baseUrl . '/PaymentWebpayReturn?' . http_build_query($qs);
header('Location: ' . $target, true, 302);
exit;
