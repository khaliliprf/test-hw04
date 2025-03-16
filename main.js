const fs = require("fs");

const c17 = require("./c17");
const c432 = require("./c432");
const c499 = require("./c499");
const c880 = require("./c880");
const c1355 = require("./c1355");
const c1908 = require("./c1908");
const c2670 = require("./c2670");
const c5315 = require("./c5315");
const c6288 = require("./c6288");
const c7552 = require("./c7552");
const a = require("./a");
const b = require("./b");

const FILE_PATH = "output.json";

function log(data) {
  try {
    // خواندن محتوای فایل (اگر وجود دارد)
    let fileContent = [];
    if (fs.existsSync(FILE_PATH)) {
      const rawData = fs.readFileSync(FILE_PATH, "utf8");
      if (rawData.trim()) {
        fileContent = JSON.parse(rawData);
      }
    }

    // اضافه کردن آبجکت جدید به آرایه
    fileContent.push(data);

    // نوشتن مجدد فایل با داده‌های جدید
    fs.writeFileSync(FILE_PATH, JSON.stringify(fileContent, null, 4), "utf8");

    console.log("Data appended successfully!");
  } catch (error) {
    console.error("Error appending data:", error);
  }
}
class Equivalence {
  totalNet = [];
  gates = [];
  outputs = [];
  inputs = [];
  remainingFaults = {};
  fanouts = {};
  visitedInputs = {};

  constructor(gates, outputs, inputs) {
    this.gates = gates;
    this.outputs = outputs;
    this.inputs = inputs;
    console.log("gates:", gates.length);
    console.log("inputs:", Object.keys(inputs).length);
    console.log("outputs:", Object.keys(outputs).length);
  }

  visit(net) {
    const netStuckAtZero = net + "-sa0";
    const netStuckAtOne = net + "-sa1";

    if (this.visitedInputs[net] && this.visitedInputs[net] === 1) {
      this.fanouts[net] = true;

      this.remainingFaults[netStuckAtZero] =
        (this.remainingFaults[netStuckAtZero] || 0) + 1;

      this.remainingFaults[netStuckAtOne] =
        (this.remainingFaults[netStuckAtOne] || 0) + 1;
    }

    this.visitedInputs[net] = (this.visitedInputs[net] || 0) + 1;

    return;
  }

  and(inputs, output) {
    const capture = {
      gate: "and",
      inputs,
      output,
      add: [],
      remove: [],
      messages: [],
    };
    let added = false;
    for (let i = 0; i < inputs.length; i++) {
      const stuckAtOneFault = inputs[i] + "-sa1";

      // add sa1 fault for all inputs
      this.remainingFaults[stuckAtOneFault] =
        (this.remainingFaults[stuckAtOneFault] || 0) + 1;
      capture.add.push(stuckAtOneFault);

      if (this.remainingFaults[inputs[i] + "-sa0"]) {
        added = true;
        const msg = "fault" + inputs[i] + "added previously";
        capture.messages.push(msg);
      }

      this.visit(inputs[i]);
    }

    // add one of inputs sa0 fault
    if (!added) {
      this.remainingFaults[inputs[0] + "-sa0"] =
        (this.remainingFaults[inputs[0] + "-sa0"] || 0) + 1;
      capture.add.push(inputs[0] + "-sa0");
    }

    // remove output sa0 if exist
    if (this.remainingFaults[output + "-sa0"]) {
      this.remainingFaults[output + "-sa0"] -= 1;
      capture.remove.push(output + "-sa0");
      if (this.remainingFaults[output + "-sa0"] === 0)
        delete this.remainingFaults[output + "-sa0"];
    }

    // add sa1 fault for output if previously not visited
    if (!this.visitedInputs[output]) {
      this.remainingFaults[output + "-sa1"] =
        (this.remainingFaults[output + "-sa1"] || 0) + 1;
      capture.add.push(output + "-sa1");
      // this.visitedInputs[output] = (this.visitedInputs[output] || 0) + 1;
    }

    return capture;
  }

  or(inputs, output) {
    const capture = {
      gate: "or",
      inputs,
      output,
      add: [],
      remove: [],
      messages: [],
    };
    let added = false;
    for (let i = 0; i < inputs.length; i++) {
      const stuckAtZeroFault = inputs[i] + "-sa0";

      this.remainingFaults[stuckAtZeroFault] =
        (this.remainingFaults[stuckAtZeroFault] || 0) + 1;
      capture.add.push(stuckAtZeroFault);

      if (this.remainingFaults[inputs[i] + "-sa1"]) {
        added = true;
        const msg = "fault" + inputs[i] + "added previously";
        capture.messages.push(msg);
      }

      this.visit(inputs[i]);
    }

    // add one of inputs sa1 fault
    if (!added) {
      this.remainingFaults[inputs[0] + "-sa1"] =
        (this.remainingFaults[inputs[0] + "-sa1"] || 0) + 1;
      capture.add.push(inputs[0] + "-sa1");
    }

    if (this.remainingFaults[output + "-sa1"]) {
      this.remainingFaults[output + "-sa1"] -= 1;
      capture.remove.push(output + "-sa1");
      if (this.remainingFaults[output + "-sa1"] === 0) {
        delete this.remainingFaults[output + "-sa1"];
      }
    }

    if (!this.visitedInputs[output]) {
      this.remainingFaults[output + "-sa0"] =
        (this.remainingFaults[output + "-sa0"] || 0) + 1;

      capture.add.push(output + "-sa0");

      // this.visitedInputs[output] = (this.visitedInputs[output] || 0) + 1;
    }

    return capture;
  }

  nand(inputs, output) {
    const capture = {
      gate: "nand",
      inputs,
      output,
      add: [],
      remove: [],
      messages: [],
    };
    let added = false;
    for (let i = 0; i < inputs.length; i++) {
      const stuckAtOneFault = inputs[i] + "-sa1";

      this.remainingFaults[stuckAtOneFault] =
        (this.remainingFaults[stuckAtOneFault] || 0) + 1;
      capture.add.push(stuckAtOneFault);

      if (this.remainingFaults[inputs[i] + "-sa0"]) {
        added = true;
        const msg = "fault" + inputs[i] + "added previously";
        capture.messages.push(msg);
      }

      this.visit(inputs[i]);
    }

    console.log("added: ", added);

    if (!added) {
      this.remainingFaults[inputs[0] + "-sa0"] =
        (this.remainingFaults[inputs[0] + "-sa0"] || 0) + 1;
      capture.add.push(inputs[0] + "-sa0");
    }

    if (this.remainingFaults[output + "-sa1"]) {
      this.remainingFaults[output + "-sa1"] -= 1;
      capture.remove.push(output + "-sa1");
      if (this.remainingFaults[output + "-sa1"] === 0) {
        delete this.remainingFaults[output + "-sa1"];
      }
    }

    if (!this.visitedInputs[output]) {
      this.remainingFaults[output + "-sa0"] =
        (this.remainingFaults[output + "-sa0"] || 0) + 1;
      capture.add.push(output + "-sa0");
      // this.visitedInputs[output] = (this.visitedInputs[output] || 0) + 1;
    }

    return capture;
  }

  nor(inputs, output) {
    const capture = {
      gate: "nor",
      inputs,
      output,
      add: [],
      remove: [],
      messages: [],
    };

    let added = false;
    for (let i = 0; i < inputs.length; i++) {
      const stuckAtZeroFault = inputs[i] + "-sa0";

      this.remainingFaults[stuckAtZeroFault] =
        (this.remainingFaults[stuckAtZeroFault] || 0) + 1;
      capture.add.push(stuckAtZeroFault);

      if (this.remainingFaults[inputs[0] + "-sa1"]) {
        added = true;
        const msg = "fault" + inputs[i] + "added previously";
        capture.messages.push(msg);
      }

      this.visit(inputs[i]);
    }

    if (!added) {
      this.remainingFaults[inputs[0] + "-sa1"] =
        (this.remainingFaults[inputs[0] + "-sa1"] || 0) + 1;
      capture.add.push(inputs[0] + "-sa1");
    }

    if (this.remainingFaults[output + "-sa0"]) {
      this.remainingFaults[output + "-sa0"] -= 1;
      capture.remove.push(output + "-sa0");

      if (this.remainingFaults[output + "-sa0"] === 0) {
        delete this.remainingFaults[output + "-sa0"];
      }
    }

    if (!this.visitedInputs[output]) {
      this.remainingFaults[output + "-sa1"] =
        (this.remainingFaults[output + "-sa1"] || 0) + 1;
      capture.add.push(output + "-sa1");

      // this.visitedInputs[output] = (this.visitedInputs[output] || 0) + 1;
    }
    return capture;
  }

  xor(inputs, output) {
    const capture = {
      gate: "xor",
      inputs,
      output,
      add: [],
      remove: [],
      messages: [],
    };
    for (let i = 0; i < inputs.length; i++) {
      const stuckAtZeroFault = inputs[i] + "-sa0";
      const stuckAtOneFault = inputs[i] + "-sa1";

      this.remainingFaults[stuckAtOneFault] =
        (this.remainingFaults[stuckAtOneFault] || 0) + 1;
      capture.add.push(stuckAtOneFault);

      this.remainingFaults[stuckAtZeroFault] =
        (this.remainingFaults[stuckAtZeroFault] || 0) + 1;
      capture.add.push(stuckAtZeroFault);

      this.visit(inputs[i]);
    }

    // if (this.remainingFaults[output + "-sa0"]) {
    //   console.log("------------------------------");
    //   this.remainingFaults[output + "-sa0"] -= 1;
    //   if (this.remainingFaults[output + "-sa0"] === 0) {
    //     delete this.remainingFaults[output + "-sa0"];
    //   }
    // }

    // if (this.remainingFaults[output + "-sa1"]) {
    //   this.remainingFaults[output + "-sa1"] -= 1;
    //   if (this.remainingFaults[output + "-sa1"] === 0) {
    //     delete this.remainingFaults[output + "-sa1"];
    //   }
    // }

    if (!this.visitedInputs[output]) {
      this.remainingFaults[output + "-sa1"] =
        (this.remainingFaults[output + "-sa1"] || 0) + 1;
      capture.add.push(output + "-sa1");

      this.remainingFaults[output + "-sa0"] =
        (this.remainingFaults[output + "-sa0"] || 0) + 1;
      capture.add.push(output + "-sa0");

      // this.visitedInputs[output] = (this.visitedInputs[output] || 0) + 1;
    }

    return capture;
  }

  buf(inputs, output) {
    const capture = {
      gate: "buf",
      inputs,
      output,
      add: [],
      remove: [],
      messages: [],
    };
    for (let i = 0; i < inputs.length; i++) {
      const stuckAtZeroFault = inputs[i] + "-sa0";
      const stuckAtOneFault = inputs[i] + "-sa1";

      this.remainingFaults[stuckAtZeroFault] =
        (this.remainingFaults[stuckAtZeroFault] || 0) + 1;
      capture.add.push(stuckAtZeroFault);

      if (
        this.visitedInputs[output] &&
        !this.remainingFaults[output + "-sa0"]
      ) {
        this.remainingFaults[stuckAtZeroFault] -= 1;
        capture.remove.push(stuckAtZeroFault);

        if (this.remainingFaults[stuckAtZeroFault] === 0)
          delete this.remainingFaults[stuckAtZeroFault];
      }

      this.remainingFaults[stuckAtOneFault] =
        (this.remainingFaults[stuckAtOneFault] || 0) + 1;
      capture.add.push(stuckAtOneFault);

      if (
        this.visitedInputs[output] &&
        !this.remainingFaults[output + "-sa1"]
      ) {
        this.remainingFaults[stuckAtOneFault] -= 1;
        capture.remove.push(stuckAtOneFault);

        if (this.remainingFaults[stuckAtOneFault] === 0)
          delete this.remainingFaults[stuckAtOneFault];
      }
      this.visit(inputs[i]);
    }

    if (this.remainingFaults[output + "-sa0"]) {
      this.remainingFaults[output + "-sa0"] -= 1;
      capture.remove.push(output + "-sa0");

      if (this.remainingFaults[output + "-sa0"] === 0) {
        delete this.remainingFaults[output + "-sa0"];
      }
    }

    if (this.remainingFaults[output + "-sa1"]) {
      this.remainingFaults[output + "-sa1"] -= 1;
      capture.remove.push(output + "-sa1");

      if (this.remainingFaults[output + "-sa1"] === 0) {
        delete this.remainingFaults[output + "-sa1"];
      }
    }

    return capture;
  }

  not(inputs, output) {
    const capture = {
      gate: "not",
      inputs,
      output,
      add: [],
      remove: [],
      messages: [],
    };
    for (let i = 0; i < inputs.length; i++) {
      const stuckAtZeroFault = inputs[i] + "-sa0";
      const stuckAtOneFault = inputs[i] + "-sa1";

      this.remainingFaults[stuckAtZeroFault] =
        (this.remainingFaults[stuckAtZeroFault] || 0) + 1;
      capture.add.push(stuckAtZeroFault);

      if (
        this.visitedInputs[output] &&
        !this.remainingFaults[output + "-sa1"]
      ) {
        this.remainingFaults[stuckAtZeroFault] -= 1;
        capture.remove.push(stuckAtZeroFault);

        if (this.remainingFaults[stuckAtZeroFault] === 0)
          delete this.remainingFaults[stuckAtZeroFault];
      }

      this.remainingFaults[stuckAtOneFault] =
        (this.remainingFaults[stuckAtOneFault] || 0) + 1;
      capture.add.push(stuckAtOneFault);

      if (
        this.visitedInputs[output] &&
        !this.remainingFaults[output + "-sa0"]
      ) {
        this.remainingFaults[stuckAtOneFault] -= 1;
        capture.remove.push(stuckAtOneFault);

        if (this.remainingFaults[stuckAtOneFault] === 0)
          delete this.remainingFaults[stuckAtOneFault];
      }
      this.visit(inputs[i]);
    }

    if (this.remainingFaults[output + "-sa0"]) {
      this.remainingFaults[output + "-sa0"] -= 1;
      capture.remove.push(output + "-sa0");

      if (this.remainingFaults[output + "-sa0"] === 0) {
        delete this.remainingFaults[output + "-sa0"];
      }
    }

    if (this.remainingFaults[output + "-sa1"]) {
      this.remainingFaults[output + "-sa1"] -= 1;
      capture.remove.push(output + "-sa1");

      if (this.remainingFaults[output + "-sa1"] === 0) {
        delete this.remainingFaults[output + "-sa1"];
      }
    }

    return capture;
  }

  addToTotal(nets) {
    for (const net of nets) {
      const stemStuckAtZero = net + "-sa0";
      const stemStuckAtOne = net + "-sa1";

      this.totalNet.push(stemStuckAtZero, stemStuckAtOne);
    }
    return;
  }

  levelize() {
    let levelCounts = 0;
    const levels = {};
    let levelizedGates = 0;
    let nextLevelInputs = this.inputs;

    while (this.gates.length !== levelizedGates) {
      const tempNextLvlOutput = {};
      for (const gate of this.gates) {
        if (gate.levelized || !nextLevelInputs[gate.inputs[0]]) continue;

        if (levels[levelCounts]) {
          levels[levelCounts].push(gate);
          tempNextLvlOutput[gate.output] = true;
          gate.levelized = true;
          levelizedGates += 1;
        } else {
          levels[levelCounts] = [];
          levels[levelCounts].push(gate);
          tempNextLvlOutput[gate.output] = true;
          gate.levelized = true;
          levelizedGates += 1;
        }
      }
      levelCounts += 1;
      nextLevelInputs = tempNextLvlOutput;
    }

    return { levelCounts, levels };
  }

  collapseRatio() {
    const { levelCounts, levels } = this.levelize();
    console.log("number of gates: ", this.gates.length);
    console.log("number of levels: ", levelCounts);

    for (let i = levelCounts - 1; i >= 0; i--) {
      const gates = levels[i];

      for (const gate of gates) {
        console.log();
        const capture = this[gate.type](gate.inputs, gate.output);
        log({
          level: i,
          gatesNum: gates.length,
          ...capture,
        });
        this.addToTotal(gate.inputs);
      }
    }

    for (const output of this.outputs) {
      this.totalNet.push(output + "-sa0", output + "-sa1");
    }

    for (const stem in this.fanouts) {
      const stemStuckAtZero = stem + "-sa0";
      const stemStuckAtOne = stem + "-sa1";
      this.totalNet.push(stemStuckAtZero, stemStuckAtOne);
    }

    let afterEqFaultCollapsing = 0;
    for (const fault in this.remainingFaults) {
      afterEqFaultCollapsing += this.remainingFaults[fault];
    }

    const total = this.totalNet.length;
    console.log({ afterEqFaultCollapsing, total });
    return (afterEqFaultCollapsing / total).toFixed(2);
  }
}

// const equivalenceCollapseRationC17 = new Equivalence(
//   c17.gates,
//   c17.outputs
//   c17.inputs
// ).collapseRatio();

const equivalenceCollapseRationC432 = new Equivalence(
  c432.gates,
  c432.outputs,
  c432.inputs
).collapseRatio();
console.log({ equivalenceCollapseRationC432 });

// const equivalenceCollapseRationC499 = new Equivalence(
//   c499.gates,
//   c499.outputs,
//   c499.inputs
// ).collapseRatio();
// console.log({ equivalenceCollapseRationC499 });

// const equivalenceCollapseRationC880 = new Equivalence(
//   c880.gates,
//   c880.outputs,
//   c880.inputs
// ).collapseRatio();
// console.log({ equivalenceCollapseRationC880 });

// const equivalenceCollapseRationC1355 = new Equivalence(
//   c1355.gates,
//   c1355.outputs,
//   c1355.inputs
// ).collapseRatio();
// console.log({ equivalenceCollapseRationC1355 });

// const equivalenceCollapseRationC1908 = new Equivalence(
//   c1908.gates,
//   c1908.outputs
// ).collapseRatio();
// console.log({equivalenceCollapseRationC1908});
// const equivalenceCollapseRationC2670 = new Equivalence(
//   c2670.gates,
//   c2670.outputs
// ).collapseRatio();
// console.log({equivalenceCollapseRationC2670});
// const equivalenceCollapseRationC5315 = new Equivalence(
//   c5315.gates,
//   c5315.outputs
// ).collapseRatio();
// console.log({equivalenceCollapseRationC5315});
// const equivalenceCollapseRationC6288 = new Equivalence(
//   c6288.gates,
//   c6288.outputs
// ).collapseRatio();
// console.log({equivalenceCollapseRationC6288});
// console.log({gates:c7552.gates.length,outputs:c7552.outputs.length});
// const equivalenceCollapseRationC7552 = new Equivalence(
//   c7552.gates,
//   c7552.outputs
// ).collapseRatio();
// console.log({equivalenceCollapseRationC7552});

// console.table(1 ,2 ,3 ,4 );

// const equivalenceCollapseRationa = new Equivalence(
//   a.gates,
//   a.outputs,
//   a.inputs
// ).collapseRatio();
// console.log({ equivalenceCollapseRationa });

// const equivalenceCollapseRationB = new Equivalence(
//   b.gates,
//   b.outputs,
//   b.inputs
// ).collapseRatio();
// console.log({ equivalenceCollapseRationB });
