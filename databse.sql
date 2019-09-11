CREATE DATABASE work;

CREATE TABLE users (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL,
    pass VARCHAR(30) NOT NULL,
    usertype INT(6) NOT NULL,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO `users` (`id`, `username`, `pass`, `usertype`, `reg_date`, `last_login`) VALUES (NULL, 'admin', 'admin', '1', current_timestamp(), current_timestamp());
