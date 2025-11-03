-- Ajouter la colonne transaction_type à la table estimation_requests
ALTER TABLE estimation_requests 
ADD COLUMN transaction_type text NOT NULL DEFAULT 'vente' CHECK (transaction_type IN ('vente', 'achat'));