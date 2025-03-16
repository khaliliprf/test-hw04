const fs = require("fs");

// Load JSON file
const FILE_PATH = "c1355.json"; // Change this to your JSON file

/**
 * Read JSON file and parse it
 */
function loadCircuit() {
  try {
    const rawData = fs.readFileSync(FILE_PATH, "utf8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Error loading circuit JSON:", error);
    return null;
  }
}

/**
 * Identify fanout points in the circuit
 */
function findFanouts(gates) {
  let fanoutMap = {};

  gates.forEach(gate => {
    gate.inputs.forEach(input => {
      if (!fanoutMap[input]) {
        fanoutMap[input] = [];
      }
      fanoutMap[input].push(gate.output);
    });
  });

  return fanoutMap;
}

/**
 * Generate all possible faults (sa0, sa1) for each gate and fanout branches
 */
function generateFaultList(gates, fanouts) {
  let faults = {};
  let totalFaults = 0;

  gates.forEach(gate => {
    // Always assign stuck-at faults to gate outputs
    faults[gate.output] = ["sa0", "sa1"];
    totalFaults += 2;

    gate.inputs.forEach(input => {
      let faultKey = input;

      // If input has multiple fanout branches, each must have its own stuck-at faults
      if (fanouts[input] && fanouts[input].length > 1) {
        fanouts[input].forEach(branch => {
          let branchFaultKey = `${input}_${branch}`;
          if (!faults[branchFaultKey]) {
            faults[branchFaultKey] = ["sa0", "sa1"];
            totalFaults += 2;
          }
        });

        // Also keep faults for the stem (main signal)
        if (!faults[input]) {
          faults[input] = ["sa0", "sa1"];
          totalFaults += 2;
        }
      } else {
        if (!faults[faultKey]) {
          faults[faultKey] = ["sa0", "sa1"];
          totalFaults += 2;
        }
      }
    });
  });

  return { faults, totalFaults };
}

/**
 * Apply fault equivalence rules and collapse redundant faults
 */
function collapseFaults(gates, faults, fanouts) {
  let collapsedFaults = JSON.parse(JSON.stringify(faults));
  let collapsedCount = 0;

  gates.forEach(gate => {
    switch (gate.type) {
      case "and":
        collapsedCount += removeEquivalentFault(
          collapsedFaults,
          gate,
          "sa0",
          "sa0"
        );
        break;
      case "or":
        collapsedCount += removeEquivalentFault(
          collapsedFaults,
          gate,
          "sa1",
          "sa1"
        );
        break;
      case "nand":
        collapsedCount += removeEquivalentFault(
          collapsedFaults,
          gate,
          "sa1",
          "sa0"
        );
        break;
      case "nor":
        collapsedCount += removeEquivalentFault(
          collapsedFaults,
          gate,
          "sa0",
          "sa1"
        );
        break;
      case "buf":
        collapsedCount += propagateBufferFault(collapsedFaults, gate);
        break;
      case "not":
        collapsedCount += propagateNotFault(collapsedFaults, gate);
        break;
      case "xor":
        // No equivalent faults for XOR
        break;
    }
  });

  let remainingFaults = Object.values(collapsedFaults).reduce(
    (sum, faults) => sum + faults.length,
    0
  );

  return { collapsedFaults, remainingFaults, collapsedCount };
}

/**
 * Remove equivalent faults based on input-output relation
 */
function removeEquivalentFault(faults, gate, outputFault, inputFault) {
  let removedCount = 0;

  if (faults[gate.output] && faults[gate.output].includes(outputFault)) {
    faults[gate.output] = faults[gate.output].filter(f => f !== outputFault);
    removedCount++;

    let inputCount = gate.inputs.length;
    let removed = 0;
    gate.inputs.forEach(input => {
      let faultKey = input;

      // Handle fanout branches separately
      if (faults[input] === undefined) {
        faults[input] = ["sa0", "sa1"];
      }

      if (removed < inputCount - 1 && faults[faultKey].includes(inputFault)) {
        faults[faultKey] = faults[faultKey].filter(f => f !== inputFault);
        removed++;
        removedCount++;
      }
    });
  }

  return removedCount;
}

/**
 * Remove redundant faults in BUF gate
 */
function propagateBufferFault(faults, gate) {
  let input = gate.inputs[0];
  let removedCount = 0;

  if (faults[input]?.includes("sa0")) {
    if (faults[gate.output]?.includes("sa0")) {
      faults[gate.output] = faults[gate.output].filter(f => f !== "sa0");
      removedCount++;
    }
  }
  if (faults[input]?.includes("sa1")) {
    if (faults[gate.output]?.includes("sa1")) {
      faults[gate.output] = faults[gate.output].filter(f => f !== "sa1");
      removedCount++;
    }
  }

  return removedCount;
}

/**
 * Remove redundant faults in NOT gate
 */
function propagateNotFault(faults, gate) {
  let input = gate.inputs[0];
  let removedCount = 0;

  if (faults[input]?.includes("sa1")) {
    if (faults[gate.output]?.includes("sa0")) {
      faults[gate.output] = faults[gate.output].filter(f => f !== "sa0");
      removedCount++;
    }
  }
  if (faults[input]?.includes("sa0")) {
    if (faults[gate.output]?.includes("sa1")) {
      faults[gate.output] = faults[gate.output].filter(f => f !== "sa1");
      removedCount++;
    }
  }

  return removedCount;
}

/**
 * Main function to run fault collapsing
 */
function main() {
  let circuit = loadCircuit();
  if (!circuit) return;

  let fanouts = findFanouts(circuit.gates);
  let { faults, totalFaults } = generateFaultList(circuit.gates, fanouts);
  let { collapsedFaults, remainingFaults, collapsedCount } = collapseFaults(
    circuit.gates,
    faults,
    fanouts
  );

  let collapseRatio = (remainingFaults / totalFaults).toFixed(3);

  let result = {
    "Total Faults": totalFaults,
    "Collapsed Faults": remainingFaults,
    "Collapse Ratio": collapseRatio,
  };

  console.log("Fault Collapsing Result:");
  console.log(JSON.stringify(result, null, 4));

  fs.writeFileSync(
    "fault_collapsing_result.json",
    JSON.stringify(result, null, 4),
    "utf8"
  );
}

main();
