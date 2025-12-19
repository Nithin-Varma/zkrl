"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function TestBorrowButton() {
  const [selectedBonds, setSelectedBonds] = useState<string[]>([]);
  const [loanAmount, setLoanAmount] = useState("");
  const [loanDuration, setLoanDuration] = useState("");

  const addBond = () => {
    setSelectedBonds([...selectedBonds, `bond-${selectedBonds.length + 1}`]);
  };

  const removeBond = () => {
    setSelectedBonds(selectedBonds.slice(0, -1));
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Test Borrow Button Logic</h2>
      
      <div className="space-y-2">
        <div>
          <label>Selected Bonds: {selectedBonds.length}</label>
          <div className="flex space-x-2">
            <Button onClick={addBond} size="sm">Add Bond</Button>
            <Button onClick={removeBond} size="sm" variant="outline">Remove Bond</Button>
          </div>
        </div>
        
        <div>
          <label>Loan Amount: </label>
          <input 
            type="text" 
            value={loanAmount} 
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="Enter amount"
            className="border p-1"
          />
        </div>
        
        <div>
          <label>Loan Duration: </label>
          <input 
            type="text" 
            value={loanDuration} 
            onChange={(e) => setLoanDuration(e.target.value)}
            placeholder="Enter duration"
            className="border p-1"
          />
        </div>
      </div>

      {/* Debug Info */}
      <div className="bg-yellow-50 p-2 rounded text-xs">
        Debug: selectedBonds={selectedBonds.length}, loanAmount="{loanAmount}", loanDuration="{loanDuration}"
      </div>

      {/* Button Logic Test */}
      {selectedBonds.length > 0 && (
        <div className="space-y-4">
          {loanAmount !== "" && loanDuration !== "" ? (
            <Button className="w-full">
              ✅ Verify Collateral Button Should Show
            </Button>
          ) : (
            <div className="text-center py-4 text-slate-500">
              <p className="text-sm">Please enter loan amount and duration to verify collateral</p>
            </div>
          )}
        </div>
      )}

      {selectedBonds.length === 0 && (
        <div className="text-center py-4 text-slate-500">
          <p className="text-sm">Please select bonds first</p>
        </div>
      )}
    </div>
  );
}
