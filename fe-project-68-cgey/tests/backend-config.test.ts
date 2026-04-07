import assert from "node:assert/strict";
import test from "node:test";

import {
  buildBackendUrl,
  DEFAULT_BACKEND_API_BASE_URL,
  getBackendApiBaseUrl,
} from "../lib/backend-config.ts";

test("getBackendApiBaseUrl prefers API_BASE_URL", () => {
  const apiBaseUrl = getBackendApiBaseUrl({
    API_BASE_URL: "http://localhost:5050/api/v1",
    NEXT_PUBLIC_API_BASE_URL: "http://localhost:3001/api/v1",
  });

  assert.equal(apiBaseUrl, "http://localhost:5050/api/v1");
});

test("getBackendApiBaseUrl falls back to NEXT_PUBLIC_API_BASE_URL", () => {
  const apiBaseUrl = getBackendApiBaseUrl({
    NEXT_PUBLIC_API_BASE_URL: "http://localhost:3001/api/v1",
  });

  assert.equal(apiBaseUrl, "http://localhost:3001/api/v1");
});

test("getBackendApiBaseUrl uses the local default when no env is set", () => {
  assert.equal(getBackendApiBaseUrl({}), DEFAULT_BACKEND_API_BASE_URL);
});

test("buildBackendUrl normalizes leading slashes", () => {
  const env = { API_BASE_URL: "http://localhost:5050/api/v1" };

  assert.equal(
    buildBackendUrl("/jobs", env),
    "http://localhost:5050/api/v1/jobs",
  );
  assert.equal(
    buildBackendUrl("companies/123", env),
    "http://localhost:5050/api/v1/companies/123",
  );
});

test("buildBackendUrl preserves query strings", () => {
  const url = buildBackendUrl("/jobs?q=frontend&sort=new", {
    API_BASE_URL: "http://localhost:5050/api/v1",
  });

  assert.equal(url, "http://localhost:5050/api/v1/jobs?q=frontend&sort=new");
});
