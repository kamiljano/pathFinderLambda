CREATE TABLE paths (
    id BIGINT PRIMARY KEY NOT NULL,
    ip BIGINT NOT NULL,
    protocol VARCHAR(5) NOT NULL,
    path VARCHAR(100) NOT NULL,
    content VARCHAR(10000),
    updated timestamp
);