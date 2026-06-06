import assert from "node:assert/strict";
import {
  buildOerCommonsSearchUrl,
  buildOpenStaxSearchUrl,
  extractOpenContentSummary,
} from "../src/lib/knowledge-expansion/open-content";

const openStax = buildOpenStaxSearchUrl("Industrial Revolution");
assert.ok(openStax.includes("openstax.org"));
assert.ok(openStax.includes("Industrial+Revolution"));

const oer = buildOerCommonsSearchUrl("Silk Road");
assert.ok(oer.includes("oercommons.org"));
assert.ok(oer.includes("Silk+Road"));

const summary = extractOpenContentSummary(
  "https://example.org/history",
  "<html><head><title>World History</title></head><body><h1>Industrial Revolution</h1><p>Factories, steam power, and global markets changed society.</p><p>Students should compare causes and effects.</p></body></html>",
  "CC BY"
);
assert.equal(summary.title, "Industrial Revolution");
assert.equal(summary.url, "https://example.org/history");
assert.equal(summary.license, "CC BY");
assert.ok(summary.summary.includes("Factories"));
assert.ok(summary.summary.length < 500);

console.log("open content adapter checks passed");
