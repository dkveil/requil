import baseConfig from '@requil/config/vitest';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(baseConfig, defineConfig({}));
