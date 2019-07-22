"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const coffee = require("coffeescript");
const less = require("less");
const yargs_1 = require("yargs");
const dependencies_1 = require("./dependencies");
const mkCoffeescriptError = (error, file) => {
    const message = error.message;
    if (error.location == null) {
        const text = [file || "<string>", message].join(":");
        return { message, text };
    }
    else {
        const location = error.location;
        const line = location.first_line + 1;
        const column = location.first_column + 1;
        const text = [file || "<string>", line, column, message].join(":");
        let markerLen = 2;
        if (location.first_line === location.last_line)
            markerLen += location.last_column - location.first_column;
        const extract = error.code.split('\n')[line - 1];
        const annotated = [
            text,
            "  " + extract,
            "  " + Array(column).join(' ') + Array(markerLen).join('^'),
        ].join('\n');
        return { message, line, column, text, extract, annotated };
    }
};
const mkLessError = (error, file) => {
    const message = error.message;
    const line = error.line;
    const column = error.column + 1;
    const text = [file || "<string>", line, column, message].join(":");
    const extract = error.extract[line];
    const annotated = [text, "  " + extract].join("\n");
    return { message, line, column, text, extract, annotated };
};
const reply = (data) => {
    process.stdout.write(JSON.stringify(data));
    process.stdout.write("\n");
};
function compile_typescript(inputs, bokehjs_dir) {
    const options = {
        noImplicitAny: true,
        noImplicitThis: true,
        noImplicitReturns: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        strictNullChecks: true,
        strictBindCallApply: false,
        strictFunctionTypes: false,
        strictPropertyInitialization: false,
        alwaysStrict: true,
        noErrorTruncation: true,
        noEmitOnError: false,
        declaration: false,
        sourceMap: false,
        importHelpers: false,
        experimentalDecorators: true,
        module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        target: ts.ScriptTarget.ES5,
        lib: [
            "lib.es5.d.ts",
            "lib.dom.d.ts",
            "lib.es2015.core.d.ts",
            "lib.es2015.promise.d.ts",
            "lib.es2015.symbol.d.ts",
            "lib.es2015.iterable.d.ts",
        ],
        types: [],
        baseUrl: ".",
        paths: {
            "*": [
                path.join(bokehjs_dir, "js/lib/*"),
                path.join(bokehjs_dir, "js/types/*"),
            ],
        },
    };
    const host = {
        getDefaultLibFileName: () => "lib.d.ts",
        getDefaultLibLocation: () => {
            // bokeh/server/static or bokehjs/build
            if (path.basename(bokehjs_dir) == "static")
                return path.join(bokehjs_dir, "lib");
            else
                return path.join(path.dirname(bokehjs_dir), "node_modules/typescript/lib");
        },
        getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
        getDirectories: (path) => ts.sys.getDirectories(path),
        getCanonicalFileName: (name) => ts.sys.useCaseSensitiveFileNames ? name : name.toLowerCase(),
        useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
        getNewLine: () => ts.sys.newLine,
        fileExists(name) {
            return inputs[name] != null || ts.sys.fileExists(name);
        },
        readFile(name) {
            return inputs[name] != null ? inputs[name] : ts.sys.readFile(name);
        },
        writeFile(name, content) {
            ts.sys.writeFile(name, content);
        },
        getSourceFile(name, target, _onError) {
            const source = inputs[name] != null ? inputs[name] : ts.sys.readFile(name);
            return source !== undefined ? ts.createSourceFile(name, source, target) : undefined;
        },
    };
    const program = ts.createProgram(Object.keys(inputs), options, host);
    const outputs = {};
    const emitted = program.emit(undefined, (name, output) => outputs[name] = output);
    const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitted.diagnostics);
    if (diagnostics.length == 0)
        return { outputs };
    else {
        const format_host = {
            getCanonicalFileName: (path) => path,
            getCurrentDirectory: ts.sys.getCurrentDirectory,
            getNewLine: () => ts.sys.newLine,
        };
        const error = ts.formatDiagnosticsWithColorAndContext(ts.sortAndDeduplicateDiagnostics(diagnostics), format_host);
        return { outputs, error };
    }
}
function compile_javascript(file, code) {
    const result = ts.transpileModule(code, {
        fileName: file,
        reportDiagnostics: true,
        compilerOptions: {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
        },
    });
    const format_host = {
        getCanonicalFileName: (path) => path,
        getCurrentDirectory: ts.sys.getCurrentDirectory,
        getNewLine: () => ts.sys.newLine,
    };
    const { outputText, diagnostics } = result;
    if (diagnostics == null || diagnostics.length == 0)
        return { output: outputText };
    else {
        const error = ts.formatDiagnosticsWithColorAndContext(ts.sortAndDeduplicateDiagnostics(diagnostics), format_host);
        return { output: outputText, error };
    }
}
function rename(p, options) {
    let { dir, name, ext } = path.parse(p);
    if (options.dir != null)
        dir = options.dir;
    if (options.ext != null)
        ext = options.ext;
    return path.format({ dir, name, ext });
}
function normalize(path) {
    return path.replace(/\\/g, "/");
}
const compile_and_resolve_deps = (input) => {
    const { file, lang, bokehjs_dir } = input;
    let { code } = input;
    let output;
    switch (lang) {
        case "typescript":
            const inputs = { [normalize(file)]: code };
            const result = compile_typescript(inputs, bokehjs_dir);
            if (result.error == null)
                output = result.outputs[normalize(rename(file, { ext: ".js" }))];
            else
                return reply({ error: result.error });
            break;
        case "coffeescript":
            try {
                code = coffee.compile(code, { bare: true, shiftLine: true });
            }
            catch (error) {
                return reply({ error: mkCoffeescriptError(error, file) });
            }
        case "javascript": {
            const result = compile_javascript(file, code);
            if (result.error == null)
                output = result.output;
            else
                return reply({ error: result.error });
            break;
        }
        case "less":
            const options = {
                paths: [path.dirname(file)],
                compress: true,
                ieCompat: false,
            };
            less.render(code, options, (error, output) => {
                if (error != null)
                    reply({ error: mkLessError(error, file) });
                else
                    reply({ code: output.css });
            });
            return;
        default:
            throw new Error(`unsupported input type: ${lang}`);
    }
    const source = ts.createSourceFile(file, output, ts.ScriptTarget.ES5, true, ts.ScriptKind.JS);
    const deps = dependencies_1.collect_deps(source);
    return reply({ code: output, deps });
};
if (yargs_1.argv.file != null) {
    const input = {
        code: fs.readFileSync(yargs_1.argv.file, "utf-8"),
        lang: yargs_1.argv.lang || "coffeescript",
        file: yargs_1.argv.file,
        bokehjs_dir: yargs_1.argv.bokehjsDir || "./build",
    };
    compile_and_resolve_deps(input);
}
else {
    const stdin = process.stdin;
    stdin.resume();
    stdin.setEncoding("utf-8");
    let data = "";
    stdin.on("data", (chunk) => data += chunk);
    stdin.on("end", () => compile_and_resolve_deps(JSON.parse(data)));
}
