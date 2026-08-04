/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(nextConfig, {
  org: "radiantz-led-lighting",
  project: "naicsdirect",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
});
