-- This is the equivalent SQL schema that Spring Boot (Hibernate) is automatically generating and running behind the scenes.
-- You can include this file if your assignment requires demonstrating your SQL tables.

CREATE DATABASE IF NOT EXISTS `smart_voting`;
USE `smart_voting`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER'
);

-- 2. Polls Table
CREATE TABLE IF NOT EXISTS `polls` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `question` VARCHAR(255) NOT NULL,
    `category` VARCHAR(255) NOT NULL DEFAULT 'General',
    `expires_at` DATETIME NULL,
    `user_id` BIGINT NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- 3. Poll Options Table
CREATE TABLE IF NOT EXISTS `poll_options` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `text` VARCHAR(255) NOT NULL,
    `vote_count` INT NOT NULL DEFAULT 0,
    `poll_id` BIGINT NOT NULL,
    FOREIGN KEY (`poll_id`) REFERENCES `polls`(`id`) ON DELETE CASCADE
);

-- 4. Votes Table (To track who voted on what, preventing double voting)
CREATE TABLE IF NOT EXISTS `votes` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `poll_id` BIGINT NOT NULL,
    `poll_option_id` BIGINT NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`poll_id`) REFERENCES `polls`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`poll_option_id`) REFERENCES `poll_options`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_user_poll_vote` (`user_id`, `poll_id`) -- Ensures a user can only vote once per poll
);
