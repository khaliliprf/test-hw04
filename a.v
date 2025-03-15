// Verilog
// test
// Ninputs 5
// Noutputs 2
// NtotalGates 6
// NAND2 6

module a (N1,N2,N3,N4,N5,N6,N7,N7,N8,N22,N23);

input N1,N2,N3,N4,N5,N6,N7,N7,N8;

output N9;

wire N10,N11,N12,N13,N14,N15;

and AND2_1 (N10,N1,N2);
and AND2_2 (N11,N3,N4);
and AND2_3 (N12,N5,N6);
and AND2_4 (N13,N7,N8);
or OR2_5 (N14,N10,N11);
or OR2_6 (N15,N12,N13);
and AND2_5 (N9,N14,N15);

endmodule