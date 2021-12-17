-- TABLE USERS
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(32) NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) NOT NULL UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at DATE NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sex INT NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_day INT NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_month INT NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_year INT NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS confirm_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at DATE DEFAULT CURRENT_DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at DATE DEFAULT CURRENT_DATE;

-- TABLE RESET PASSWORD

CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY
);

ALTER TABLE password_resets ADD COLUMN IF NOT EXISTS email VARCHAR(255) NOT NULL;
ALTER TABLE password_resets ADD COLUMN IF NOT EXISTS token VARCHAR(255) NOT NULL;
ALTER TABLE password_resets ADD COLUMN IF NOT EXISTS created_at DATE DEFAULT CURRENT_DATE;
ALTER TABLE password_resets ADD COLUMN IF NOT EXISTS updated_at DATE DEFAULT CURRENT_DATE;

-- TABLE CHATS
CREATE TABLE IF NOT EXISTS chats(
    ID SERIAL PRIMARY KEY
);


ALTER TABLE chats ADD COLUMN IF NOT EXISTS user_id_1 INT NOT NULL;
ALTER TABLE chats DROP CONSTRAINT IF EXISTS user_id_1;
ALTER TABLE chats ADD CONSTRAINT user_id_1 FOREIGN KEY (user_id_1) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE chats ADD COLUMN IF NOT EXISTS user_id_2 INT NOT NULL;
ALTER TABLE chats DROP CONSTRAINT IF EXISTS user_id_2;
ALTER TABLE chats ADD CONSTRAINT user_id_2 FOREIGN KEY (user_id_2) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE chats ADD COLUMN IF NOT EXISTS created_at DATE DEFAULT CURRENT_DATE;
ALTER TABLE chats ADD COLUMN IF NOT EXISTS updated_at DATE DEFAULT CURRENT_DATE;

-- TABLE MESSAGE
CREATE TABLE IF NOT EXISTS messages(
    ID SERIAL PRIMARY KEY
);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS user_id INT NOT NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS text VARCHAR(255) NOT NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS created_at DATE DEFAULT CURRENT_DATE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS updated_at DATE DEFAULT CURRENT_DATE;