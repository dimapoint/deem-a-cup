import {GlobalRegistrator} from '@happy-dom/global-registrator';
import {afterEach} from 'bun:test';
import {cleanup} from '@testing-library/react';

// Register Happy DOM
GlobalRegistrator.register();

// Cleanup React after each test
afterEach(() => {
	cleanup();
});
