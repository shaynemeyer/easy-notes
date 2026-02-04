#!/usr/bin/env bun

import { Database } from 'bun:sqlite';

const db = new Database('data/app.db');

console.log('Tables in database:');
const tables = db.query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
tables.forEach((table: any) => console.log(`  - ${table.name}`));

console.log('\nIndexes:');
const indexes = db.query("SELECT name FROM sqlite_master WHERE type='index' ORDER BY name").all();
indexes.forEach((index: any) => console.log(`  - ${index.name}`));

db.close();
