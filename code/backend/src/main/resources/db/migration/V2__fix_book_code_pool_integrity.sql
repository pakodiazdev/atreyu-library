-- V2: Restaura el invariante de book_code_pool roto por el seeder legado
-- BookSeederProd insertaba libros sin eliminar sus códigos del pool,
-- dejando códigos duplicados en books y book_code_pool. Esto causa que
-- BookSeederCsv (y cualquier llamada futura a createAll) falle con una
-- violación de restricción única al tomar uno de esos códigos.
-- Es un no-op en bases de datos limpias (DELETE sobre intersección vacía).
DELETE FROM book_code_pool WHERE code IN (SELECT code FROM books);
