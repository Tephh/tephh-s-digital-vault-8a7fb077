-- Remove the fixed app check constraint so admin can create any app name
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_app_check;