#!/usr/bin/env node

import {
  extractParams,
  Middlewares,
  PrepareConfig,
} from "@atrilabs/commands-builder";
import { createEntry } from "./createEntry";
import path from "path";
import startDevServer from "../dev/startDevServer";
import { RuleSetRule } from "webpack";
import { getCorePkgInfo, getExposedBlocks, readToolConfig } from "./utils";
import { watchManifestDirs } from "./machine/watchManifestDirs";
import { editorServerMachineInterpreter } from "./machine/init";
import { NETWORK_REQUEST } from "../dev/serverMachine";
import { computeFSAndSend } from "./machine/computeManifestIR";
import { EditorAppServerPlugin } from "./webpack-plugins/EditorAppServerPlugins";
import startManifestRegistryLibDevServer from "./startManifestRegistryLibDevServer";

function main() {
  // TODO: copy public folder if not already exists
  const params = extractParams();

  const toolConfig = readToolConfig();

  watchManifestDirs(
    toolConfig.manifestDirs.map(({ pkg }) =>
      // @ts-ignore
      path.dirname(__non_webpack_require__.resolve(pkg))
    )
  );

  computeFSAndSend(
    editorServerMachineInterpreter,
    toolConfig.manifestDirs.map(({ pkg }) =>
      // @ts-ignore
      path.dirname(__non_webpack_require__.resolve(pkg))
    )
  );

  const additionalInclude = params.additionalInclude || [];
  additionalInclude.push(
    // @ts-ignore
    path.dirname(__non_webpack_require__.resolve("@atrilabs/atri-app-core")),
    // @ts-ignore
    path.dirname(__non_webpack_require__.resolve("@atrilabs/core")),
    path.dirname(
      // @ts-ignore
      __non_webpack_require__.resolve(
        "@atrilabs/react-component-manifest-schema"
      )
    ),
    path.dirname(
      // @ts-ignore
      __non_webpack_require__.resolve(
        "@atrilabs/component-icon-manifest-schema"
      )
    ),
    ...toolConfig.layers.map(({ pkg }) => {
      return path.dirname(
        // @ts-ignore
        __non_webpack_require__.resolve(pkg)
      );
    }),
    ...toolConfig.runtimes.map(({ pkg }) => {
      return path.dirname(
        // @ts-ignore
        __non_webpack_require__.resolve(pkg)
      );
    }),
    ...toolConfig.manifestDirs.map(({ pkg }) => {
      return path.dirname(
        // @ts-ignore
        __non_webpack_require__.resolve(pkg)
      );
    }),
    ...toolConfig.manifestSchema.map(({ pkg }) => {
      return path.dirname(
        // @ts-ignore
        __non_webpack_require__.resolve(pkg)
      );
    })
  );
  params.additionalInclude = additionalInclude;

  params.paths.appSrc = process.cwd();

  const externals = {
    react: "React",
    "react-dom": "ReactDOM",
  };

  const prepareConfig = params.prepareConfig;
  const wrapPrepareConfig: PrepareConfig = (config) => {
    if (prepareConfig) {
      prepareConfig(config);
    }
    config.entry = createEntry;
    config.externals = externals;
    config.optimization = {
      ...config.optimization,
      runtimeChunk: "single",
      splitChunks: { chunks: "all" },
    };
    config.devServer = {
      ...config.devServer,
      hot: true,
    };
    config.resolveLoader = {
      alias: {
        "api-entry-loader": path.resolve(
          __dirname,
          "..",
          "src",
          "scripts",
          "dev-editor",
          "loaders",
          "api-entry-loader.js"
        ),
        "browser-forest-manager-entry-loader": path.resolve(
          __dirname,
          "..",
          "src",
          "scripts",
          "dev-editor",
          "loaders",
          "browser-forest-manager-entry-loader.js"
        ),
        "block-registry-entry-loader": path.resolve(
          __dirname,
          "..",
          "src",
          "scripts",
          "dev-editor",
          "loaders",
          "block-registry-entry-loader.js"
        ),
      },
    };
    const plugins = config.plugins || [];
    plugins.push(new EditorAppServerPlugin());
    config.plugins = plugins;
  };

  const middlewares = params.middlewares;
  const wrapMiddlewares: Middlewares = (app, compiler, config) => {
    // TODO: insert the necessary logic for hot reload
    if (middlewares) {
      middlewares(app, compiler, config);
    }
    app.use((req, res, next) => {
      editorServerMachineInterpreter.send({
        type: NETWORK_REQUEST,
        input: { req, res, next },
      });
    });
  };

  const corePkgInfo = getCorePkgInfo();
  const customLoaders: RuleSetRule[] = [
    {
      test: corePkgInfo.apiFile,
      use: {
        loader: "api-entry-loader",
        options: {
          eventClientModulePath: toolConfig.clients.eventClient.modulePath,
        },
      },
    },
    {
      test: corePkgInfo.browserForestManagerFile,
      use: {
        loader: "browser-forest-manager-entry-loader",
        options: {
          forests: toolConfig.forests,
        },
      },
    },
    {
      test: corePkgInfo.blockRegistryFile,
      use: {
        loader: "block-registry-entry-loader",
        options: {
          exposedBlocks: getExposedBlocks(toolConfig),
        },
      },
    },
  ];

  startDevServer({
    ...params,
    prepareConfig: wrapPrepareConfig,
    middlewares: wrapMiddlewares,
    outputFilename: "editor/js/pages/[name].js",
    customLoaders,
    generateIndexHtml: true,
    babel: {
      plugins: [
        [
          path.resolve(
            __dirname,
            "..",
            "src",
            "scripts",
            "dev-editor",
            "babel-plugins",
            "replace-import-with-id.js"
          ),
          {},
        ],
      ],
    },
  });

  startManifestRegistryLibDevServer({
    ...params,
    babel: {
      plugins: [
        [
          path.resolve(
            __dirname,
            "..",
            "src",
            "scripts",
            "dev-editor",
            "babel-plugins",
            "replace-import-with-id.js"
          ),
          {},
        ],
      ],
    },
    externals,
    toolConfig,
    corePkgInfo,
  });
}

main();
