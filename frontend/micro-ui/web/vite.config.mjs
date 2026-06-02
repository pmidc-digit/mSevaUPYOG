import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import envCompatible from 'vite-plugin-env-compatible';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      viteCommonjs(),
      svgr({
        include: '**/*.svg',
        svgrOptions: {
          exportType: 'named',
          ref: true,
          svgo: false,
          titleProp: true,
        },
      }),
      react(),
      envCompatible(),
    ],
    esbuild: {
      loader: 'jsx',
      include: [/src\/.*\.js$/, /micro-ui-internals\/.*\.js$/],
      exclude: [],
    },
    optimizeDeps: {
      exclude: ['@pmidc/upyog-css', 'util'],
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    base: '/digit-ui/',
    server: {
      port: 3000,
      proxy: {
        '^/(access|egov-mdms-service|egov-location|localization|egov-workflow-v2|pgr-services|swach-services|filestore|egov-hrms|user-otp|user|fsm|billing-service|collection-services|pdf-service|pg-service|vehicle|vendor|rainmaker-pgr|property-services|fsm-calculator|pt-calculator-v2|dashboard-analytics|echallan-services|egov-searcher|egov-pdf|tl-services|tl-calculator|edcr|bpa-services|noc-services|firenoc-services|egov-user-event|egov-document-uploader|egov-survey-services|ws-services|sw-services|ws-calculator|sw-calculator|report|inbox|service-request|pet-services|requester-services-dx|sv-services|chb-services|asset-services|pgr-ai-services|egov-esign|ndc-services|ndc-calculator|bpa-calculator|noc-calculator|challan-generation|layout-services|adv-services|rl-services|clu-services|clu-calculator|layout-calculator|gc-services|gc-calculator)': {
          target: env.REACT_APP_PROXY_URL || env.REACT_APP_PROXY_API || 'https://sdc-uat.lgpunjab.gov.in/',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: [
        { find: /^@mseva\/digit-ui-module-core$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/core/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-core\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/core/$1") },

        { find: /^@mseva\/digit-ui-react-components$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/react-components/src/index.js") },
        { find: /^@mseva\/digit-ui-react-components\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/react-components/$1") },

        { find: /^@mseva\/digit-ui-libraries$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/libraries/src/index.js") },
        { find: /^@mseva\/digit-ui-libraries\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/libraries/$1") },

        { find: /^@mseva\/digit-ui-module-pgr$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/pgr/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-pgr\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/pgr/$1") },

        { find: /^@mseva\/digit-ui-module-ptr$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/ptr/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-ptr\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/ptr/$1") },

        { find: /^@mseva\/digit-ui-module-bills$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/bills/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-bills\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/bills/$1") },

        { find: /^@mseva\/digit-ui-module-mcollect$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/mCollect/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-mcollect\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/mCollect/$1") },

        { find: /^@mseva\/digit-ui-module-challangeneration$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/challanGeneration/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-challangeneration\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/challanGeneration/$1") },

        { find: /^@mseva\/digit-ui-module-garbagecollection$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/garbageCollection/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-garbagecollection\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/garbageCollection/$1") },

        { find: /^@mseva\/digit-ui-module-rentandlease$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/rentAndLease/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-rentandlease\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/rentAndLease/$1") },

        { find: /^@mseva\/digit-ui-module-swach$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/swach/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-swach\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/swach/$1") },

        { find: /^@mseva\/digit-ui-module-fsm$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/fsm/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-fsm\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/fsm/$1") },

        { find: /^@mseva\/digit-ui-module-pt$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/pt/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-pt\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/pt/$1") },

        { find: /^@mseva\/digit-ui-module-tl$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/tl/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-tl\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/tl/$1") },

        { find: /^@mseva\/digit-ui-module-obps$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/obps/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-obps\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/obps/$1") },

        { find: /^@mseva\/digit-ui-module-noc$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/noc/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-noc\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/noc/$1") },

        { find: /^@mseva\/digit-ui-module-ws$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/ws/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-ws\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/ws/$1") },

        { find: /^@mseva\/digit-ui-module-common$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/common/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-common\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/common/$1") },

        { find: /^@mseva\/digit-ui-module-commonpt$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/commonPt/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-commonpt\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/commonPt/$1") },

        { find: /^@mseva\/digit-ui-module-dss$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/dss/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-dss\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/dss/$1") },

        { find: /^@mseva\/digit-ui-module-hrms$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/hrms/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-hrms\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/hrms/$1") },

        { find: /^@mseva\/digit-ui-module-engagement$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/engagement/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-engagement\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/engagement/$1") },

        { find: /^@mseva\/digit-ui-module-ndc$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/ndc/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-ndc\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/ndc/$1") },

        { find: /^@mseva\/digit-ui-module-firenoc$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/Firenoc/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-firenoc\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/Firenoc/$1") },

        { find: /^@mseva\/digit-ui-module-receipts$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/receipts/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-receipts\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/receipts/$1") },

        { find: /^@mseva\/digit-ui-module-sv$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/sv/src/Module.js") },
        { find: /^@mseva\/digit-ui-module-sv\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/sv/$1") },

        { find: /^@mseva\/upyog-ui-module-ads$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/ads/src/Module.js") },
        { find: /^@mseva\/upyog-ui-module-ads\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/ads/$1") },

        { find: /^@mseva\/upyog-ui-module-chb$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/chb/src/Module.js") },
        { find: /^@mseva\/upyog-ui-module-chb\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/chb/$1") },

        { find: /^@mseva\/upyog-ui-module-asset$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/asset/src/Module.js") },
        { find: /^@mseva\/upyog-ui-module-asset\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/asset/$1") },

        { find: /^@mseva\/upyog-ui-module-pgrai$/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/pgrai/src/Module.js") },
        { find: /^@mseva\/upyog-ui-module-pgrai\/(.*)/, replacement: path.resolve(__dirname, "./micro-ui-internals/packages/modules/pgrai/$1") },

        { find: "src", replacement: path.resolve(__dirname, 'src') },
      ],
      dedupe: ['react', 'react-dom', 'i18next', 'react-i18next', 'react-query'],
    },
    build: {
      outDir: 'build',
    },
  };
});
