// Verilog
// test
// Ninputs 5
// Noutputs 2
// NtotalGates 6
// NAND2 6

module b (N1,N2,N3,N4,N5);

input N1,N2,N3,N4;

output N5;

wire N6,N7,N8,N9,N10,N11,N12,N13,N14;

and AND2_1 (N10,N1,N2);
and AND2_2 (N11,N2,N3);
and AND2_3 (N12,N3,N4);
or OR2_5 (N13,N10,N11);
or OR2_6 (N14,N11,N12);
and AND2_4 (N5,N13,N14);

endmodule