import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    runes: true
  },
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: false,
      envPrefix: '',
    }),
    alias: {
      $lib: './src/lib',
      $components: './src/lib/components',
      $stores: './src/lib/stores',
      $utils: './src/lib/utils'
    }
  }
};

export default config;