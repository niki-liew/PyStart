const output = document.getElementById("output");

const editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    mode: {
        name: "python",
        version: 3,
        singleLineStringErrors: false
    },
    lineNumbers: true,
    indentUnit: 4,
    matchBrackets: true
});

editor.setValue(`print("Hello World!")`);
// output.value = "Initializing...\n"; LOADING

async function main() {
    let pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.18.1/full/"
    });

    // output.value += "Ready!\n"; LOADED

    return pyodide;
}

let pyodideReadyPromise = main();

function addToOutput(s) {
    output.value += s + "\n";
}

async function evaluatePython() {
    let pyodide = await pyodideReadyPromise;

    // output.value += ">>> " + editor.getValue() + "\n";
    output.value = "";

    try {

        // create fake stdout collector
        pyodide.runPython(`
import sys
from io import StringIO

sys.stdout = StringIO()
        `);

        // run user code
        let result = pyodide.runPython(editor.getValue());

        // get printed output
        let printed = pyodide.runPython(`
sys.stdout.getvalue()
        `);

        // show printed text
        if (printed) {
            output.value += printed;
        }

        // show returned value if exists
        if (result !== undefined) {
            output.value += result + "\n";
        }

    } catch (err) {
        output.value += err + "\n";
    }
}   