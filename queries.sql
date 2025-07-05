/* Create the noted_games table */

CREATE TABLE noted_games (
id SERIAL PRIMARY KEY,
	game_name VARCHAR(100) NOT NULL,
	note INTEGER CONSTRAINT check_limit CHECK (note >= 0 AND note <=5),
	description VARCHAR(255),
	date_publication DATE,
	img VARCHAR(255),
	date_entry text
)