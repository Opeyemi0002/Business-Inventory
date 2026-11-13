INSERT INTO category(name, description)

VALUES 
('ELECTRONICS', 'phones, tablets'),
('CLOTHINGS', 'tops, blouse, trousers'),
('MACHINES', 'blenders, air-fryer')

ON CONFLICT(name) DO NOTHING