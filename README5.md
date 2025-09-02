# backend/hostgator-php

Sube estos archivos a tu hosting (cPanel → File Manager) en:
`public_html/api/webpay/`

- `return-callback.php` → evidencia de tokens y redirección a tu sitio
- `receipts-by-transaction.php` → stub de recibo (JSON)

Puedes activar URLs bonitas con `.htaccess` (opcional).
