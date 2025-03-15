const c17 = require("./c17");
const c432 = require("./c432");
const c499 = require("./c499");
const c880 = require("./c880");
const c1908 = require("./c1908");
const c2670 = require("./c2670");
const c5315 = require("./c5315");
const c6288 = require("./c6288");
const c7552 = require("./c7552");
const a = require("./a");
const b = require("./b");

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
    for (let i = 0; i < inputs.length; i++) {
      const stuckAtOneFault = inputs[i] + "-sa1";

      // add sa1 fault for all inputs
      this.remainingFaults[stuckAtOneFault] =
        (this.remainingFaults[stuckAtOneFault] || 0) + 1;

      this.visit(inputs[i]);
    }

    // add one of inputs sa0 fault
    this.remainingFaults[inputs[0] + "-sa0"] =
      (this.remainingFaults[inputs[0] + "-sa0"] || 0) + 1;

    // remove output sa0 if exist
    if (this.remainingFaults[output + "-sa0"]) {
      this.remainingFaults[output + "-sa0"] -= 1;
      if (this.remainingFaults[output + "-sa0"] === 0)
        delete this.remainingFaults[output + "-sa0"];
    }

    // add sa1 fault for output if previously not visited
    if (!this.visitedInputs[output])
      this.remainingFaults[output + "-sa1"] =
        (this.remainingFaults[output + "-sa1"] || 0) + 1;
    return;
  }

  or(inputs, output) {
    for (let i = 0; i < inputs.length; i++) {
      const stuckAtZeroFault = inputs[i] + "-sa0";

      this.remainingFaults[stuckAtZeroFault] =
        (this.remainingFaults[stuckAtZeroFault] || 0) + 1;

      this.visit(inputs[i]);
    }

    // add one of inputs sa1 fault
    this.remainingFaults[inputs[0] + "-sa1"] =
      (this.remainingFaults[inputs[0] + "-sa1"] || 0) + 1;

    if (this.remainingFaults[output + "-sa1"]) {
      this.remainingFaults[output + "-sa1"] -= 1;
      if (this.remainingFaults[output + "-sa1"] === 0) {
        delete this.remainingFaults[output + "-sa1"];
      }
    }

    if (!this.visitedInputs[output])
      this.remainingFaults[output + "-sa0"] =
        (this.remainingFaults[output + "-sa0"] || 0) + 1;
    return;
  }

  nand(inputs, output) {
    for (let i = 0; i < inputs.length; i++) {
      const stuckAtOneFault = inputs[i] + "-sa1";

      this.remainingFaults[stuckAtOneFault] =
        (this.remainingFaults[stuckAtOneFault] || 0) + 1;

      this.visit(inputs[i]);
    }

    this.remainingFaults[inputs[0] + "-sa0"] =
      (this.remainingFaults[inputs[0] + "-sa0"] || 0) + 1;

    if (this.remainingFaults[output + "-sa1"]) {
      this.remainingFaults[output + "-sa1"] -= 1;
      if (this.remainingFaults[output + "-sa1"] === 0) {
        delete this.remainingFaults[output + "-sa1"];
      }
    }

    if (!this.visitedInputs[output])
      this.remainingFaults[output + "-sa0"] =
        (this.remainingFaults[output + "-sa0"] || 0) + 1;
    return;
  }

  nor(inputs, output) {
    for (let i = 0; i < inputs.length; i++) {
      const stuckAtZeroFault = inputs[i] + "-sa0";

      this.remainingFaults[stuckAtZeroFault] =
        (this.remainingFaults[stuckAtZeroFault] || 0) + 1;

      this.visit(inputs[i]);
    }

    this.remainingFaults[inputs[0] + "-sa1"] =
      (this.remainingFaults[inputs[0] + "-sa1"] || 0) + 1;

    if (this.remainingFaults[output + "-sa0"]) {
      this.remainingFaults[output + "-sa0"] -= 1;
      if (this.remainingFaults[output + "-sa0"] === 0) {
        delete this.remainingFaults[output + "-sa0"];
      }
    }

    if (!this.visitedInputs[output])
      this.remainingFaults[output + "-sa1"] =
        (this.remainingFaults[output + "-sa1"] || 0) + 1;
    return;
  }

  buf(inputs, output) {
    for (let i = 0; i < inputs.length; i++) {
      const stuckAtZeroFault = inputs[i] + "-sa0";
      const stuckAtOneFault = inputs[i] + "-sa1";

      this.remainingFaults[stuckAtZeroFault] =
        (this.remainingFaults[stuckAtZeroFault] || 0) + 1;

      this.remainingFaults[stuckAtOneFault] =
        (this.remainingFaults[stuckAtOneFault] || 0) + 1;

      this.visit(inputs[i]);
    }

    if (this.remainingFaults[output + "-sa0"]) {
      this.remainingFaults[output + "-sa0"] -= 1;
      if (this.remainingFaults[output + "-sa0"] === 0) {
        delete this.remainingFaults[output + "-sa0"];
      }
    }

    if (this.remainingFaults[output + "-sa1"]) {
      this.remainingFaults[output + "-sa1"] -= 1;
      if (this.remainingFaults[output + "-sa1"] === 0) {
        delete this.remainingFaults[output + "-sa1"];
      }
    }

    return;
  }

  not(inputs, output) {
    for (let i = 0; i < inputs.length; i++) {
      const stuckAtZeroFault = inputs[i] + "-sa0";
      const stuckAtOneFault = inputs[i] + "-sa1";

      this.remainingFaults[stuckAtZeroFault] =
        (this.remainingFaults[stuckAtZeroFault] || 0) + 1;

      this.remainingFaults[stuckAtOneFault] =
        (this.remainingFaults[stuckAtOneFault] || 0) + 1;

      this.visit(inputs[i]);
    }

    if (this.remainingFaults[output + "-sa0"]) {
      this.remainingFaults[output + "-sa0"] -= 1;
      if (this.remainingFaults[output + "-sa0"] === 0) {
        delete this.remainingFaults[output + "-sa0"];
      }
    }

    if (this.remainingFaults[output + "-sa1"]) {
      this.remainingFaults[output + "-sa1"] -= 1;
      if (this.remainingFaults[output + "-sa1"] === 0) {
        delete this.remainingFaults[output + "-sa1"];
      }
    }

    return;
  }

  //   xor(inputs) {
  //     // for (let i = 0; i < inputs.length; i++) {
  //     //   const stuckAtZeroFault = inputs[i] + "-sa0";
  //     //   const stuckAtOneFault = inputs[i] + "-sa1";

  //     //   this.remainingFaults[stuckAtZeroFault] = 1;
  //     //   this.remainingFaults[stuckAtOneFault] = 1;
  //     // }
  //     return;
  //   }

  addToTotal(nets) {
    for (const net of nets) {
      const stemStuckAtZero = net + "-sa0";
      const stemStuckAtOne = net + "-sa1";

      this.totalNet.push(stemStuckAtZero, stemStuckAtOne);

      // if (this.visitedInputs[net] && this.visitedInputs[net] === 1) {
      //   console.log(this.visitedInputs[net]);
      //   this.fanouts[net] = true;
      //   // this.remainingFaults[stemStuckAtZero] =
      //   //   (this.remainingFaults[stemStuckAtZero] || 0) + 1;
      //   // this.remainingFaults[stemStuckAtOne] =
      //   //   (this.remainingFaults[stemStuckAtOne] || 0) + 1;

      //   continue;
      // }

      // this.visitedInputs[net] = (this.visitedInputs[net] || 0) + 1;
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
      console.log('level: ',i,gates.length);

      for (const gate of gates) {
        this[gate.type](gate.inputs, gate.output);
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

    // console.log(this.remainingFaults);

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
// const equivalenceCollapseRationC432 = new Equivalence(
//   c432.gates,
//   c432.outputs
//   c432.inputs
// ).collapseRatio();
// const equivalenceCollapseRationC499 = new Equivalence(
//   c499.gates,
//   c499.outputs
//   c499.inputs
// ).collapseRatio();

const equivalenceCollapseRationC880 = new Equivalence(
  c880.gates,
  c880.outputs,
  c880.inputs
).collapseRatio();
console.log({ equivalenceCollapseRationC880 });

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

const equivalenceCollapseRationa = new Equivalence(
  a.gates,
  a.outputs,
  a.inputs
).collapseRatio();
console.log({ equivalenceCollapseRationa });

const equivalenceCollapseRationB = new Equivalence(
  b.gates,
  b.outputs,
  b.inputs
).collapseRatio();
console.log({ equivalenceCollapseRationB });
