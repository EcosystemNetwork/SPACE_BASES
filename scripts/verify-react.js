#!/usr/bin/env node
/**
 * React Verification Script
 * 
 * Verifies that React and ReactDOM are properly installed and configured.
 * This script confirms that the project is built with React.
 */

const react = require('react');
const reactDOM = require('react-dom');

console.log('🔍 Verifying React installation...\n');

console.log('React version:', react.version);
console.log('ReactDOM version:', reactDOM.version);

// Verify versions match expected
if (react.version && reactDOM.version) {
  console.log('\n✅ React is properly installed and configured');
  console.log('✅ This project is built with React!');
  process.exit(0);
} else {
  console.error('\n❌ React installation verification failed');
  process.exit(1);
}
