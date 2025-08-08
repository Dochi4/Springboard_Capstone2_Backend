\echo 'Delete and recreate newbookdb?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS newbookdb;
CREATE DATABASE newbookdb;
\connect newbookdb

\i newbook-schema.sql

\echo 'Delete and recreate newbookdb_test?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS newbookdb_test;
CREATE DATABASE newbookdb_test;
\connect newbookdb_test
\i newbook-schema.sql

\q
