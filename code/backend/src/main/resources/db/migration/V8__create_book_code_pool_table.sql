CREATE TABLE book_code_pool (
    code VARCHAR(3) PRIMARY KEY
);

INSERT INTO book_code_pool (code)
SELECT chr(letter_code) || LPAD(num::text, 2, '0')
FROM generate_series(ascii('A'), ascii('Z')) AS letter_code
CROSS JOIN generate_series(0, 99) AS num;
